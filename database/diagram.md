# SponsorBase Database Diagram

## Conceptual Model

```
┌─────────────────┐
│    companies    │
├─────────────────┤
│ id (PK)         │
│ name            │
│ website         │
│ industry        │
│ description     │
│ size            │
│ headquarters    │
│ founded_year    │
│ is_active       │
│ created_at      │
│ updated_at      │
└─────────────────┘
         │
         ├──┬──────────────────────────────────────┐
         │                                      │
         ▼                                      ▼
┌─────────────────┐                    ┌─────────────────┐
│    contacts     │                    │ sponsorship_    │
├─────────────────┤                    │ types           │
│ id (PK)         │                    ├─────────────────┤
│ company_id (FK) │                    │ id (PK)         │
│ name            │                    │ name            │
│ email           │                    │ description     │
│ role            │                    │ created_at      │
│ linkedin_url   │                    └─────────────────┘
│ phone           │                            │
│ is_verified     │                            │
│ verification_   │                            │
│ source          │                            ▼
│ created_at      │                    ┌─────────────────┐
│ updated_at      │                    │    events       │
└─────────────────┘                    ├─────────────────┤
                                        │ id (PK)         │
                                        │ company_id (FK) │
                                        │ event_name      │
                                        │ event_type      │
                                        │ sponsorship_    │
                                        │ type_id (FK)    │
                                        │ sponsorship_    │
                                        │ level           │
                                        │ amount_range    │
                                        │ year            │
                                        │ month           │
                                        │ source_url      │
                                        │ is_verified     │
                                        │ submitted_by    │
                                        │ created_at      │
                                        │ updated_at      │
                                        └─────────────────┘
```

## Entity Relationships

### Core Relationships

```
companies (1) ─────── (N) contacts
     │                           │
     │ has                       │ belongs to
     ▼                           ▼
┌─────────────┐         ┌─────────────┐
│   Company    │         │   Contact   │
│ - name       │         │ - name      │
│ - website    │         │ - email     │
│ - industry   │         │ - role      │
└─────────────┘         └─────────────┘
```

```
companies (1) ─────── (N) sponsorship_types
     │                           │
     │ offers                    │ belongs to
     ▼                           ▼
┌─────────────┐         ┌─────────────┐
│   Company    │         │ Sponsorship │
│ - name       │         │   Type      │
│ - industry   │         │ - name      │
│ - size       │         │ - description│
└─────────────┘         └─────────────┘
```

```
companies (1) ─────── (N) events
     │                           │
     │ sponsors                  │ sponsored by
     ▼                           ▼
┌─────────────┐         ┌─────────────┐
│   Company    │         │    Event    │
│ - name       │         │ - name      │
│ - website    │         │ - type      │
│ - industry   │         │ - year      │
└─────────────┘         │ - level     │
                        └─────────────┘
```

## Relationship Summary

| Company | Has | Description |
|---------|-----|-------------|
| **Company** | **Many Contacts** | Multiple people to contact for sponsorships |
| **Company** | **Many Sponsorship Types** | Different ways they can sponsor (Gold, Silver, etc.) |
| **Company** | **Many Events** | Historical record of sponsored events |

## Data Flow Example

### Real-world scenario: Notion sponsoring HackMIT

```
┌─────────────────┐
│   Notion        │  ← Company
├─────────────────┤
│ Industry:       │
│ Productivity    │
│ Software        │
└─────────────────┘
         │
         ├──┬──────────────────────────────────────┐
         │                                      │
         ▼                                      ▼
┌─────────────────┐                    ┌─────────────────┐
│ partnerships@  │                    │ Gold Sponsor    │
│ notion.so       │  ← Contact        │ $5,000-$10,000  │  ← Sponsorship Type
│ Partnerships    │                    │ Premium branding│
│ Team            │                    │ Speaking slot   │
└─────────────────┘                    └─────────────────┘
         │                                      │
         │                                      ▼
         │                            ┌─────────────────┐
         │                            │ HackMIT 2023    │  ← Event
         └────────────────────────────►├─────────────────┤
                                      │ Type: Hackathon│
                                      │ Level: Gold     │
                                      │ Year: 2023      │
                                      │ Location: MIT   │
                                      └─────────────────┘
```

## Query Patterns

### Find all contacts for a company
```sql
SELECT * FROM contacts 
WHERE company_id = 'notion_id';
```

### Find all sponsorship types a company offers
```sql
SELECT st.* FROM sponsorship_types st
JOIN company_sponsorship_types cst ON st.id = cst.sponsorship_type_id
WHERE cst.company_id = 'notion_id';
```

### Find all events sponsored by a company
```sql
SELECT * FROM events 
WHERE company_id = 'notion_id'
ORDER BY year DESC;
```

### Complete company profile
```sql
SELECT 
    c.name as company,
    c.website,
    c.industry,
    cnt.name as contact_name,
    cnt.email as contact_email,
    e.event_name,
    e.year,
    e.sponsorship_level
FROM companies c
LEFT JOIN contacts cnt ON c.id = cnt.company_id
LEFT JOIN events e ON c.id = e.company_id
WHERE c.id = 'notion_id';
```

## Entity-Relationship Diagram (ERD) Notation

### Cardinality
- **1:N** - One-to-many relationship
- **N:M** - Many-to-many relationship (via junction tables)

### Symbols
- **PK** - Primary Key
- **FK** - Foreign Key
- **(1)** - One side of relationship
- **(N)** - Many side of relationship

## Implementation Notes

### Foreign Key Constraints
```sql
-- contacts.company_id references companies.id
ALTER TABLE contacts 
ADD CONSTRAINT fk_contacts_company 
FOREIGN KEY (company_id) REFERENCES companies(id);

-- events.company_id references companies.id
ALTER TABLE events 
ADD CONSTRAINT fk_events_company 
FOREIGN KEY (company_id) REFERENCES companies(id);
```

### Indexing Strategy
```sql
-- Company lookups
CREATE INDEX idx_contacts_company ON contacts(company_id);
CREATE INDEX idx_events_company ON events(company_id);

-- Search optimization
CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_events_year ON events(year);
```

## Scaling Considerations

### From 10 to 100 Companies
- Single table queries perform well
- Basic indexing sufficient
- No performance issues expected

### From 100 to 1,000 Companies
- Need proper indexing on foreign keys
- Consider query optimization
- Monitor slow queries

### From 1,000 to 10,000+ Companies
- Implement partitioning by industry
- Add caching for frequently accessed companies
- Consider read replicas for heavy query loads
- Optimize join queries with proper indexes

## Data Integrity

### Business Rules
1. Every contact must belong to a company
2. Every event must have a sponsoring company
3. Company names must be unique
4. Email addresses must be unique per company

### Validation
```sql
-- Ensure every contact has a valid company
ALTER TABLE contacts 
ADD CONSTRAINT chk_contact_company 
CHECK (company_id IN (SELECT id FROM companies));

-- Ensure every event has a valid company
ALTER TABLE events 
ADD CONSTRAINT chk_event_company 
CHECK (company_id IN (SELECT id FROM companies));
```

## Future Extensions

### Additional Relationships
- **Users** who submit company information
- **Categories** for industry classification
- **Locations** for geographic filtering
- **Outreach** tracking for contact attempts

### Enhanced Features
- **Sponsorship history** analytics
- **Contact verification** workflow
- **Event categorization** system
- **Geographic filtering** capabilities
