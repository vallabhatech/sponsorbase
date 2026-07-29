import { pathToFileURL } from 'node:url';

const APIFY_ACTOR_ENDPOINT =
  'https://api.apify.com/v2/acts/vivid_astronaut~company-enrichment/run-sync-get-dataset-items';
const MAX_TOTAL_CHARGE_USD = '0.02';
const MAX_RESPONSE_BYTES = 64 * 1024;
const DEFAULT_TIMEOUT_MS = 120_000;

const EXPECTED_RESULT_KEYS = [
  'description',
  'domain',
  'industryCandidate',
  'integrationSource',
  'nameCandidate',
  'observedAt',
  'provenance',
  'success',
  'website',
].sort();

const EXPECTED_PROVENANCE_KEYS = ['caveat', 'method', 'sourceUrl'].sort();

export type EnrichmentErrorCode =
  | 'INVALID_DOMAIN'
  | 'APIFY_TOKEN_REQUIRED'
  | 'APIFY_RESPONSE_TOO_LARGE'
  | 'APIFY_INVALID_RESPONSE'
  | 'APIFY_HTTP_ERROR_NO_RETRY'
  | 'APIFY_REQUEST_OUTCOME_UNKNOWN';

export class CompanyEnrichmentError extends Error {
  readonly code: EnrichmentErrorCode;

  constructor(code: EnrichmentErrorCode) {
    super(code);
    this.name = 'CompanyEnrichmentError';
    this.code = code;
  }
}

export interface CompanyCandidate {
  domain: string;
  nameCandidate: string | null;
  description: string | null;
  industryCandidate: string | null;
  website: string;
  observedAt: string;
  provenance: {
    method: 'website_metadata_scrape';
    sourceUrl: string;
    caveat: 'Candidate fields are not authoritative registry data.';
  };
}

export interface CompanyModerationDraft {
  contentType: 'company';
  action: 'create';
  status: 'pending';
  humanReviewRequired: true;
  data: CompanyCandidate;
}

type FetchLike = (
  input: string | URL,
  init?: RequestInit,
) => Promise<Response>;

interface EnrichOptions {
  domain: string;
  apifyToken: string | undefined;
  fetchImpl?: FetchLike;
  timeoutMs?: number;
}

function fail(code: EnrichmentErrorCode): never {
  throw new CompanyEnrichmentError(code);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function hasExactKeys(value: Record<string, unknown>, expected: string[]): boolean {
  return JSON.stringify(Object.keys(value).sort()) === JSON.stringify(expected);
}

export function normalizeDomain(value: string): string {
  if (typeof value !== 'string' || value !== value.trim()) fail('INVALID_DOMAIN');

  const domain = value.toLowerCase();
  if (domain.length < 4 || domain.length > 253) fail('INVALID_DOMAIN');
  if (
    domain.includes('://') ||
    domain.includes('/') ||
    domain.includes('\\') ||
    domain.includes(':') ||
    domain.includes('@') ||
    domain.includes('?') ||
    domain.includes('#') ||
    domain.includes('*') ||
    /\s/.test(domain) ||
    domain.startsWith('.') ||
    domain.endsWith('.') ||
    domain.includes('..')
  ) {
    fail('INVALID_DOMAIN');
  }

  const labels = domain.split('.');
  if (labels.length < 2 || !/^[a-z]{2,63}$/.test(labels.at(-1) ?? '')) {
    fail('INVALID_DOMAIN');
  }
  for (const label of labels) {
    if (
      label.length < 1 ||
      label.length > 63 ||
      !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label)
    ) {
      fail('INVALID_DOMAIN');
    }
  }
  return domain;
}

function validateToken(value: string | undefined): string {
  if (
    typeof value !== 'string' ||
    value.length < 16 ||
    value.length > 1024 ||
    value !== value.trim() ||
    /\s/.test(value)
  ) {
    fail('APIFY_TOKEN_REQUIRED');
  }
  return value;
}

function optionalBoundedText(
  value: unknown,
  maxLength: number,
): string | null {
  if (value === null) return null;
  if (typeof value !== 'string') fail('APIFY_INVALID_RESPONSE');
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (!normalized) return null;
  if (normalized.length > maxLength) fail('APIFY_INVALID_RESPONSE');
  return normalized;
}

function validateObservedAt(value: unknown): string {
  if (typeof value !== 'string' || value.length > 40) {
    fail('APIFY_INVALID_RESPONSE');
  }
  const match = value.match(
    /^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})(?:\.[0-9]{1,9})?Z$/,
  );
  if (!match) fail('APIFY_INVALID_RESPONSE');

  const timestamp = Date.parse(value);
  const parsed = new Date(timestamp);
  const expected = match.slice(1, 7).map(Number);
  const actual = [
    parsed.getUTCFullYear(),
    parsed.getUTCMonth() + 1,
    parsed.getUTCDate(),
    parsed.getUTCHours(),
    parsed.getUTCMinutes(),
    parsed.getUTCSeconds(),
  ];
  if (!Number.isFinite(timestamp) || actual.some((part, index) => part !== expected[index])) {
    fail('APIFY_INVALID_RESPONSE');
  }
  return value;
}

async function readBoundedJson(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';
  if (!contentType.startsWith('application/json')) fail('APIFY_INVALID_RESPONSE');

  const declaredLength = Number(response.headers.get('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_RESPONSE_BYTES) {
    fail('APIFY_RESPONSE_TOO_LARGE');
  }

  const reader = response.body?.getReader();
  if (!reader) fail('APIFY_INVALID_RESPONSE');

  const decoder = new TextDecoder();
  let byteCount = 0;
  let body = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      byteCount += value.byteLength;
      if (byteCount > MAX_RESPONSE_BYTES) {
        await reader.cancel();
        fail('APIFY_RESPONSE_TOO_LARGE');
      }
      body += decoder.decode(value, { stream: true });
    }
    body += decoder.decode();
  } finally {
    reader.releaseLock();
  }

  try {
    return JSON.parse(body);
  } catch {
    fail('APIFY_INVALID_RESPONSE');
  }
}

function curateCandidate(raw: unknown, expectedDomain: string): CompanyCandidate {
  if (!Array.isArray(raw) || raw.length !== 1 || !isPlainObject(raw[0])) {
    fail('APIFY_INVALID_RESPONSE');
  }

  const item = raw[0];
  if (!hasExactKeys(item, EXPECTED_RESULT_KEYS)) fail('APIFY_INVALID_RESPONSE');
  if (item.success !== true || item.domain !== expectedDomain) {
    fail('APIFY_INVALID_RESPONSE');
  }

  const expectedWebsite = `https://${expectedDomain}/`;
  if (item.website !== expectedWebsite || !isPlainObject(item.provenance)) {
    fail('APIFY_INVALID_RESPONSE');
  }
  if (!hasExactKeys(item.provenance, EXPECTED_PROVENANCE_KEYS)) {
    fail('APIFY_INVALID_RESPONSE');
  }
  if (
    item.provenance.method !== 'website_metadata_scrape' ||
    item.provenance.sourceUrl !== expectedWebsite ||
    item.provenance.caveat !== 'Candidate fields are not authoritative registry data.'
  ) {
    fail('APIFY_INVALID_RESPONSE');
  }

  return {
    domain: expectedDomain,
    nameCandidate: optionalBoundedText(item.nameCandidate, 200),
    description: optionalBoundedText(item.description, 1_000),
    industryCandidate: optionalBoundedText(item.industryCandidate, 120),
    website: expectedWebsite,
    observedAt: validateObservedAt(item.observedAt),
    provenance: {
      method: 'website_metadata_scrape',
      sourceUrl: expectedWebsite,
      caveat: 'Candidate fields are not authoritative registry data.',
    },
  };
}

export async function enrichCompanyCandidate({
  domain: rawDomain,
  apifyToken: rawToken,
  fetchImpl = globalThis.fetch.bind(globalThis),
  timeoutMs = DEFAULT_TIMEOUT_MS,
}: EnrichOptions): Promise<CompanyCandidate> {
  const domain = normalizeDomain(rawDomain);
  const apifyToken = validateToken(rawToken);
  const endpoint = new URL(APIFY_ACTOR_ENDPOINT);
  endpoint.searchParams.set('maxItems', '1');
  endpoint.searchParams.set('maxTotalChargeUsd', MAX_TOTAL_CHARGE_USD);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  let response: Response;
  try {
    // A retry could duplicate a billable Actor run after a lost response, so this
    // adapter deliberately performs exactly one POST for each explicit call.
    response = await fetchImpl(endpoint, {
      method: 'POST',
      redirect: 'error',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${apifyToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ domain }),
    });
  } catch {
    // The Actor may have started even when the response was lost. Surface an
    // ambiguous outcome and require an operator to inspect Apify before retrying.
    fail('APIFY_REQUEST_OUTCOME_UNKNOWN');
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) fail('APIFY_HTTP_ERROR_NO_RETRY');
  return curateCandidate(await readBoundedJson(response), domain);
}

export function toModerationQueueDraft(
  candidate: CompanyCandidate,
): CompanyModerationDraft {
  return {
    contentType: 'company',
    action: 'create',
    status: 'pending',
    humanReviewRequired: true,
    data: candidate,
  };
}

async function main(): Promise<void> {
  const domain = process.argv[2];
  if (!domain) {
    process.stderr.write('Usage: company-enricher.ts <company-domain>\n');
    process.exitCode = 2;
    return;
  }

  try {
    const candidate = await enrichCompanyCandidate({
      domain,
      apifyToken: process.env.APIFY_TOKEN,
    });
    process.stdout.write(`${JSON.stringify(toModerationQueueDraft(candidate), null, 2)}\n`);
  } catch (error) {
    const code =
      error instanceof CompanyEnrichmentError
        ? error.code
        : 'APIFY_REQUEST_OUTCOME_UNKNOWN';
    process.stderr.write(`Company enrichment failed: ${code}. No retry was attempted.\n`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
