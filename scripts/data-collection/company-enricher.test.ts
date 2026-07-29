import assert from 'node:assert/strict';
import test from 'node:test';

import {
  CompanyEnrichmentError,
  enrichCompanyCandidate,
  toModerationQueueDraft,
} from './company-enricher.ts';

const TEST_TOKEN = 'test-token-value-not-secret-12345';

function actorItem(domain = 'example.com'): Record<string, unknown> {
  return {
    success: true,
    domain,
    website: `https://${domain}/`,
    nameCandidate: ' Example   Company ',
    description: ' Public website description. ',
    industryCandidate: ' Software ',
    provenance: {
      method: 'website_metadata_scrape',
      sourceUrl: `https://${domain}/`,
      caveat: 'Candidate fields are not authoritative registry data.',
    },
    integrationSource: 'apify-store',
    observedAt: '2026-07-29T12:00:00.000Z',
  };
}

function jsonResponse(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

test('uses the fixed Actor, charge cap, caller token, and one-domain body', async () => {
  let calls = 0;
  const candidate = await enrichCompanyCandidate({
    domain: 'Example.COM',
    apifyToken: TEST_TOKEN,
    fetchImpl: async (input, init) => {
      calls += 1;
      const url = new URL(input);
      assert.equal(
        url.pathname,
        '/v2/acts/vivid_astronaut~company-enrichment/run-sync-get-dataset-items',
      );
      assert.equal(url.searchParams.get('maxItems'), '1');
      assert.equal(url.searchParams.get('maxTotalChargeUsd'), '0.02');
      assert.equal(init?.method, 'POST');
      assert.equal(init?.redirect, 'error');
      assert.deepEqual(JSON.parse(String(init?.body)), { domain: 'example.com' });
      assert.equal(
        (init?.headers as Record<string, string>).Authorization,
        `Bearer ${TEST_TOKEN}`,
      );
      return jsonResponse([actorItem()]);
    },
  });

  assert.equal(calls, 1);
  assert.deepEqual(candidate, {
    domain: 'example.com',
    nameCandidate: 'Example Company',
    description: 'Public website description.',
    industryCandidate: 'Software',
    website: 'https://example.com/',
    observedAt: '2026-07-29T12:00:00.000Z',
    provenance: {
      method: 'website_metadata_scrape',
      sourceUrl: 'https://example.com/',
      caveat: 'Candidate fields are not authoritative registry data.',
    },
  });
});

test('creates a pending, human-reviewed moderation draft and nothing authoritative', () => {
  const candidate = {
    domain: 'example.com',
    nameCandidate: 'Example Company',
    description: null,
    industryCandidate: null,
    website: 'https://example.com/',
    observedAt: '2026-07-29T12:00:00.000Z',
    provenance: {
      method: 'website_metadata_scrape' as const,
      sourceUrl: 'https://example.com/',
      caveat: 'Candidate fields are not authoritative registry data.' as const,
    },
  };
  const draft = toModerationQueueDraft(candidate);

  assert.deepEqual(draft, {
    contentType: 'company',
    action: 'create',
    status: 'pending',
    humanReviewRequired: true,
    data: candidate,
  });
  assert.equal('contacts' in draft.data, false);
  assert.equal('country' in draft.data, false);
  assert.equal('size' in draft.data, false);
  assert.equal('funding' in draft.data, false);
});

test('rejects invalid domains before making a request', async () => {
  let calls = 0;
  await assert.rejects(
    enrichCompanyCandidate({
      domain: 'https://example.com/path',
      apifyToken: TEST_TOKEN,
      fetchImpl: async () => {
        calls += 1;
        return jsonResponse([actorItem()]);
      },
    }),
    (error: unknown) =>
      error instanceof CompanyEnrichmentError && error.code === 'INVALID_DOMAIN',
  );
  assert.equal(calls, 0);
});

test('requires a caller-owned token before making a request', async () => {
  let calls = 0;
  await assert.rejects(
    enrichCompanyCandidate({
      domain: 'example.com',
      apifyToken: undefined,
      fetchImpl: async () => {
        calls += 1;
        return jsonResponse([actorItem()]);
      },
    }),
    (error: unknown) =>
      error instanceof CompanyEnrichmentError && error.code === 'APIFY_TOKEN_REQUIRED',
  );
  assert.equal(calls, 0);
});

test('does not retry an ambiguous network failure or expose the token', async () => {
  let calls = 0;
  let captured: unknown;
  try {
    await enrichCompanyCandidate({
      domain: 'example.com',
      apifyToken: TEST_TOKEN,
      fetchImpl: async () => {
        calls += 1;
        throw new Error(`connection lost after sending ${TEST_TOKEN}`);
      },
    });
  } catch (error) {
    captured = error;
  }

  assert.equal(calls, 1);
  assert.ok(captured instanceof CompanyEnrichmentError);
  assert.equal(captured.code, 'APIFY_REQUEST_OUTCOME_UNKNOWN');
  assert.equal(String(captured).includes(TEST_TOKEN), false);
});

test('does not retry a non-success HTTP response', async () => {
  let calls = 0;
  await assert.rejects(
    enrichCompanyCandidate({
      domain: 'example.com',
      apifyToken: TEST_TOKEN,
      fetchImpl: async () => {
        calls += 1;
        return jsonResponse({ error: 'upstream unavailable' }, 503);
      },
    }),
    (error: unknown) =>
      error instanceof CompanyEnrichmentError &&
      error.code === 'APIFY_HTTP_ERROR_NO_RETRY',
  );
  assert.equal(calls, 1);
});

test('rejects non-website fields even in an otherwise successful item', async () => {
  const raw = { ...actorItem(), country: 'US' };
  await assert.rejects(
    enrichCompanyCandidate({
      domain: 'example.com',
      apifyToken: TEST_TOKEN,
      fetchImpl: async () => jsonResponse([raw]),
    }),
    (error: unknown) =>
      error instanceof CompanyEnrichmentError && error.code === 'APIFY_INVALID_RESPONSE',
  );
});

test('rejects mismatched provenance and oversized responses', async (t) => {
  await t.test('mismatched provenance', async () => {
    const raw = actorItem();
    raw.provenance = {
      method: 'estimated',
      sourceUrl: 'https://other.example/',
      caveat: 'Unverified estimate.',
    };
    await assert.rejects(
      enrichCompanyCandidate({
        domain: 'example.com',
        apifyToken: TEST_TOKEN,
        fetchImpl: async () => jsonResponse([raw]),
      }),
      (error: unknown) =>
        error instanceof CompanyEnrichmentError && error.code === 'APIFY_INVALID_RESPONSE',
    );
  });

  await t.test('invalid observation timestamp', async () => {
    const raw = actorItem();
    raw.observedAt = '2026-02-30T12:00:00Z';
    await assert.rejects(
      enrichCompanyCandidate({
        domain: 'example.com',
        apifyToken: TEST_TOKEN,
        fetchImpl: async () => jsonResponse([raw]),
      }),
      (error: unknown) =>
        error instanceof CompanyEnrichmentError && error.code === 'APIFY_INVALID_RESPONSE',
    );
  });

  await t.test('declared response size above 64 KiB', async () => {
    await assert.rejects(
      enrichCompanyCandidate({
        domain: 'example.com',
        apifyToken: TEST_TOKEN,
        fetchImpl: async () =>
          new Response(JSON.stringify([actorItem()]), {
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': String(65 * 1024),
            },
          }),
      }),
      (error: unknown) =>
        error instanceof CompanyEnrichmentError &&
        error.code === 'APIFY_RESPONSE_TOO_LARGE',
    );
  });
});
