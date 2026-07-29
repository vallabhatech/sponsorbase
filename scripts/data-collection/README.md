# Data Collection Scripts

This directory contains scripts for collecting and validating sponsor data from various sources.

## Company enrichment provider (implemented)

`company-enricher.ts` accepts one bare, public company domain and calls the
[`vivid_astronaut/company-enrichment`](https://apify.com/vivid_astronaut/company-enrichment)
Actor with the caller's own `APIFY_TOKEN`.

```bash
cd scripts/data-collection
npm ci
APIFY_TOKEN='your-scoped-token' npm exec -- tsx company-enricher.ts example.com
```

The adapter deliberately has a narrow trust boundary:

- one domain and at most one result per call;
- fixed `maxTotalChargeUsd=0.02` ceiling (Actor/platform charges may apply);
- a single billable `POST`, with no automatic retry when its outcome is
  ambiguous;
- a 120-second timeout and a 64 KiB response limit;
- only `nameCandidate`, `description`, `industryCandidate`, `website`, the
  observation timestamp, and website-derived provenance are accepted;
- country, contacts, company size, funding, and any unexpected response field
  are rejected;
- the token is read from the environment, never included in output, and errors
  use fixed codes rather than upstream bodies.

The command emits a moderation draft with `status: "pending"` and
`humanReviewRequired: true`. It does **not** insert or update a company. Before
persistence, a human moderator must verify the source website, resolve
duplicates by normalized domain/name, and map accepted candidate fields to the
authoritative company record. A lost or timed-out response may still correspond
to a charged Actor run; inspect Apify run history before any manual retry.

Run the isolated tests without a real token or network request:

```bash
npm test
npm run typecheck
```

## Scripts Overview

### Web Scraping Scripts
- `company-enricher.ts` - Creates a human-reviewed company candidate from one
  public company website via a caller-funded Apify Actor
- `company-scraper.py` - Scrapes company information from various sources
- `event-scraper.py` - Collects sponsorship information from event websites
- `contact-finder.py` - Finds and validates contact information

### Data Validation Scripts
- `email-validator.py` - Validates email addresses and checks deliverability
- `company-verifier.py` - Cross-references company information across sources
- `duplicate-detector.py` - Identifies and handles duplicate entries

### Data Import Scripts
- `csv-importer.py` - Imports data from CSV files
- `api-importer.py` - Imports data from external APIs
- `bulk-uploader.py` - Handles bulk data uploads with validation

## Usage

### Setup
```bash
# Install required dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys and configurations
```

### Running Scripts
```bash
# Run company scraper
python company-scraper.py --source techcrunch --limit 100

# Validate emails
python email-validator.py --input contacts.csv --output validated-contacts.csv

# Import data
python csv-importer.py --file sponsors.csv --table companies
```

## Data Sources

### Primary Sources
- Company websites and press releases
- Event sponsor pages
- Tech news sites (TechCrunch, VentureBeat, etc.)
- LinkedIn company pages
- Industry conference websites

### Secondary Sources
- Company databases (Crunchbase, PitchBook)
- Professional networks
- Industry associations
- Event directories

## Data Quality Standards

### Required Fields
- Company name (required)
- Website (required)
- Industry (required)
- At least one contact method (email or phone)

### Optional Fields
- Company description
- Year founded
- Company size
- Headquarters location
- Social media profiles

### Validation Rules
- Emails must be valid format and deliverable
- Websites must be accessible
- Company names must be unique (case-insensitive)
- Industry must match predefined categories

## Scheduling

### Automated Collection
- Daily: New company discovery
- Weekly: Sponsorship history updates
- Monthly: Contact information verification
- Quarterly: Full data validation

### Manual Review
- All new submissions require manual review
- High-value companies get priority verification
- Community submissions need moderation

## API Integration

### Supported APIs
- Google Places API for company verification
- Hunter.io for email finding
- Clearbit for company enrichment
- Crunchbase API for company data

### Rate Limits
- Respect all API rate limits
- Implement exponential backoff for failures
- Cache responses to minimize API calls

## Error Handling

### Logging
- All operations logged to `logs/` directory
- Error logs include full stack traces
- Success logs include operation metrics

### Retry Logic
- Network failures: 3 retries with exponential backoff
- API errors: Check rate limits, retry if appropriate
- Data validation errors: Log and continue with next record

## Security Considerations

### API Keys
- Store API keys in environment variables
- Rotate keys regularly
- Monitor API usage for anomalies

### Data Privacy
- Respect robots.txt files
- Follow GDPR and data protection laws
- Only collect publicly available information

## Contributing

When adding new data collection scripts:

1. Follow the existing code structure
2. Add comprehensive error handling
3. Include unit tests
4. Update this documentation
5. Add logging and monitoring

## Troubleshooting

### Common Issues
- **API rate limits**: Check usage, implement backoff
- **Website changes**: Update selectors and parsing logic
- **Data quality**: Run validation scripts
- **Performance**: Optimize queries and add caching

### Getting Help
- Check the logs in `logs/` directory
- Review the troubleshooting guide
- Create an issue with detailed error information
