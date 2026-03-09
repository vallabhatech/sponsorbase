# Architecture

## System Overview

SponsorBase is a full-stack web application built with modern technologies to provide a scalable and maintainable platform for sponsor discovery.

## Technology Stack

### Frontend
- **Next.js 14** - React framework with server-side rendering
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type-safe JavaScript
- **React Query** - Data fetching and caching
- **Framer Motion** - Animations and transitions

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type-safe development
- **Prisma** - Database ORM
- **JWT** - Authentication tokens

### Database
- **PostgreSQL** - Primary database
- **Redis** - Caching and session storage
- **Meilisearch** - Full-text search engine

### Infrastructure
- **Vercel** - Frontend hosting
- **Railway/Render** - Backend hosting
- **Supabase** - Database hosting
- **Cloudflare** - CDN and security

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Next.js)     │◄──►│   (Express)     │◄──►│  (PostgreSQL)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │              ┌─────────────────┐
         │                       │              │   Search Engine │
         │                       │◄─────────────►│  (Meilisearch)  │
         │                       │              └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────►│      Cache      │◄─────────────┘
                        │     (Redis)     │
                        └─────────────────┘
```

## Database Schema

### Core Tables

#### Companies
- id (UUID, Primary Key)
- name (VARCHAR)
- description (TEXT)
- website (VARCHAR)
- logo_url (VARCHAR)
- industry (VARCHAR)
- size (VARCHAR)
- headquarters (VARCHAR)
- founded_year (INTEGER)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

#### SponsorshipContacts
- id (UUID, Primary Key)
- company_id (UUID, Foreign Key)
- name (VARCHAR)
- email (VARCHAR)
- role (VARCHAR)
- linkedin_url (VARCHAR)
- is_verified (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

#### Sponsorships
- id (UUID, Primary Key)
- company_id (UUID, Foreign Key)
- event_name (VARCHAR)
- event_type (VARCHAR)
- sponsorship_level (VARCHAR)
- amount_range (VARCHAR)
- year (INTEGER)
- source_url (VARCHAR)
- is_verified (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

#### Categories
- id (UUID, Primary Key)
- name (VARCHAR)
- description (TEXT)
- created_at (TIMESTAMP)

#### CompanyCategories
- company_id (UUID, Foreign Key)
- category_id (UUID, Foreign Key)

## API Design

### RESTful Endpoints

#### Companies
- GET /api/companies - List companies with pagination
- GET /api/companies/:id - Get company details
- POST /api/companies - Create new company
- PUT /api/companies/:id - Update company
- DELETE /api/companies/:id - Delete company

#### Search
- GET /api/search/companies - Search companies
- GET /api/search/sponsors - Search sponsorship history

#### Sponsorships
- GET /api/sponsorships - List sponsorships
- POST /api/sponsorships - Add sponsorship record
- PUT /api/sponsorships/:id - Update sponsorship

## Security Considerations

### Authentication
- JWT-based authentication
- Refresh token rotation
- Password hashing with bcrypt

### Authorization
- Role-based access control
- API rate limiting
- Input validation and sanitization

### Data Protection
- HTTPS everywhere
- Environment variable encryption
- Database connection encryption
- Regular security audits

## Performance Optimization

### Frontend
- Code splitting and lazy loading
- Image optimization with Next.js Image
- Static generation where possible
- Client-side caching strategies

### Backend
- Database query optimization
- Redis caching for frequent queries
- API response compression
- Connection pooling

### Search
- Meilisearch for fast full-text search
- Search result caching
- Autocomplete suggestions
- Faceted search capabilities

## Deployment Strategy

### Development
- Local development with Docker Compose
- Hot reload for frontend and backend
- Database migrations with Prisma

### Staging
- Automated testing pipeline
- Feature flag system
- Performance monitoring
- Security scanning

### Production
- Blue-green deployment
- Database backups
- Monitoring and alerting
- Disaster recovery plan
