# SponsorBase Database

This directory contains the complete database schema and seed data for the SponsorBase platform.

## Overview

The SponsorBase database is designed to scale from 10 to 10,000+ sponsors while maintaining data integrity and query performance. It follows a relational model with proper normalization and indexing.

## Data Model

### Core Entities

#### Companies
The central entity representing sponsor companies with comprehensive metadata:
- Basic information (name, description, website)
- Industry categorization
- Company size and location
- Contact information

#### Contacts
Multiple contact points per company with verification status:
- Email addresses and roles
- LinkedIn profiles
- Phone numbers
- Verification tracking

#### Sponsorships
Historical record of company sponsorships:
- Event details and types
- Sponsorship levels and amounts
- Temporal data (year/month)
- Source verification

#### Categories
Flexible categorization system for companies:
- Industry classifications
- Sponsorship preferences
- Custom tags

## Schema Design Principles

### Scalability
- **UUID primary keys** for distributed systems
- **Proper indexing** on frequently queried columns
- **Junction tables** for many-to-many relationships
- **Timestamps** for audit trails

### Data Integrity
- **Foreign key constraints** for referential integrity
- **UNIQUE constraints** to prevent duplicates
- **CHECK constraints** for data validation
- **CASCADE operations** for data consistency

### Performance
- **GIN indexes** for full-text search
- **Composite indexes** for complex queries
- **Optimized data types** for storage efficiency
- **Query-friendly structure** for common operations

## Tables Overview

### Core Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `companies` | Company information | name, industry, size, website |
| `sponsorship_contacts` | Contact details | email, role, is_verified |
| `sponsorships` | Sponsorship history | event_name, amount_range, year |
| `categories` | Category definitions | name, description |
| `users` | User accounts | email, role, reputation_score |

### Junction Tables

| Table | Relationship | Purpose |
|-------|-------------|---------|
| `company_categories` | Companies ↔ Categories | Many-to-many categorization |

### Supporting Tables

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `outreach_templates` | Email templates | Public/private sharing |
| `moderation_queue` | Content moderation | Workflow management |
| `search_analytics` | Usage tracking | Performance metrics |

## Relationships

```
Companies (1) ──── (N) SponsorshipContacts
Companies (1) ──── (N) Sponsorships
Companies (N) ──── (N) Categories (via company_categories)
Users (1) ──── (N) OutreachTemplates
Users (1) ──── (N) Sponsorships (submitted_by)
```

## Data Flow

### Sponsor Discovery
1. User searches for companies by industry/size
2. System queries companies with relevant categories
3. Results include contact information and sponsorship history

### Community Contributions
1. Users submit new company/sponsorship data
2. Submissions enter moderation queue
3. Approved data becomes part of main database

### Outreach Management
1. Users select companies for sponsorship requests
2. System provides contact information and templates
3. Outreach activity is tracked for analytics

## Scaling Considerations

### From 10 to 100 Sponsors
- Single database instance sufficient
- Basic indexing provides adequate performance
- Manual moderation manageable

### From 100 to 1,000 Sponsors
- Implement automated moderation rules
- Add caching for frequently accessed data
- Introduce full-text search capabilities

### From 1,000 to 10,000+ Sponsors
- Database sharding by industry/region
- Dedicated search engine integration
- Advanced analytics and reporting
- Automated data quality monitoring

## Performance Optimization

### Query Optimization
```sql
-- Find sponsors by industry with recent activity
SELECT c.name, sc.email, s.event_name, s.year
FROM companies c
JOIN company_categories cc ON c.id = cc.company_id
JOIN categories cat ON cc.category_id = cat.id
JOIN sponsorship_contacts sc ON c.id = sc.company_id
JOIN sponsorships s ON c.id = s.company_id
WHERE cat.name = 'Technology'
  AND s.year >= 2022
  AND sc.is_verified = true;
```

### Index Strategy
- **Primary indexes** on UUID columns
- **Search indexes** on name and description fields
- **Filtering indexes** on industry, size, and verification status
- **Time-based indexes** on created_at and year columns

## Data Quality

### Validation Rules
- Email format validation
- URL accessibility checking
- Company name deduplication
- Industry taxonomy enforcement

### Verification Process
1. **Automatic verification** via API lookups
2. **Community verification** through user voting
3. **Manual verification** by moderators
4. **Periodic re-verification** of existing data

## Security

### Access Control
- **Role-based permissions** for different user types
- **Row-level security** for sensitive data
- **Audit logging** for all data modifications
- **Encryption** for contact information

### Privacy Considerations
- **GDPR compliance** for EU users
- **Data retention policies** for inactive accounts
- **Right to deletion** for user-submitted data
- **Consent management** for contact information

## Migration Strategy

### Schema Versioning
- **Sequential migration files** (001_initial.sql, 002_add_features.sql)
- **Rollback procedures** for each migration
- **Data transformation scripts** for major changes
- **Backup procedures** before migrations

### Data Migration
```sql
-- Example: Adding new industry classification
ALTER TABLE companies ADD COLUMN sub_industry VARCHAR(100);
UPDATE companies SET sub_industry = 'SaaS' WHERE industry = 'Software' AND description ILIKE '%software-as-a-service%';
```

## Backup and Recovery

### Backup Strategy
- **Daily full backups** with retention policy
- **Hourly incremental backups** for critical data
- **Point-in-time recovery** capability
- **Cross-region backup replication**

### Recovery Procedures
- **Database restoration** from backups
- **Data consistency checks** after recovery
- **Service continuity planning**
- **Disaster recovery testing**

## Monitoring

### Performance Metrics
- **Query execution times**
- **Database connection usage**
- **Index efficiency analysis**
- **Storage utilization tracking**

### Data Quality Metrics
- **Verification rates** by data source
- **Duplicate detection accuracy**
- **Contact information freshness**
- **User submission quality scores**

## Getting Started

### Development Setup
```bash
# Create database
createdb sponsorbase

# Run schema migration
psql -d sponsorbase -f schema.sql

# Load seed data
psql -d sponsorbase -f seed-data.sql
```

### Testing
```bash
# Run database tests
npm run test:database

# Validate schema
npm run validate:schema
```

## Contributing

When modifying the database schema:

1. **Create migration file** with proper versioning
2. **Add comprehensive tests** for new functionality
3. **Update documentation** with changes
4. **Test with sample data** before deployment
5. **Consider performance impact** of changes

## Future Enhancements

### Planned Features
- **Geographic indexing** for regional sponsor searches
- **Sponsorship scoring** based on historical patterns
- **API integration** with external data sources
- **Machine learning** for contact information prediction

### Scalability Improvements
- **Read replicas** for improved query performance
- **Partitioning** for large historical datasets
- **Caching layer** for frequently accessed data
- **Search engine integration** for advanced queries
