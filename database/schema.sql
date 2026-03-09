-- SponsorBase Database Schema
-- PostgreSQL database structure for sponsor management platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table for company categorization
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Companies table - core sponsor information
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    website VARCHAR(255),
    description TEXT,
    industry VARCHAR(100),
    country VARCHAR(100),
    logo_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Company categories junction table
CREATE TABLE company_categories (
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (company_id, category_id)
);

-- Contacts table for company contact information
CREATE TABLE contacts (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    source VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sponsorship types table for company sponsorship preferences
CREATE TABLE sponsorship_types (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    type VARCHAR(100),
    support_type VARCHAR(255),
    avg_amount VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events table for tracking past sponsorship history
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    event_name VARCHAR(255),
    year INTEGER,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sponsorship history
CREATE TABLE sponsorships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    event_name VARCHAR(255) NOT NULL,
    event_type VARCHAR(100), -- e.g., 'hackathon', 'conference', 'meetup'
    sponsorship_level VARCHAR(100), -- e.g., 'Gold', 'Silver', 'Bronze'
    amount_range VARCHAR(50), -- e.g., '$1,000-$5,000', '$5,000-$10,000'
    year INTEGER NOT NULL,
    month INTEGER, -- Optional month for more precise tracking
    source_url VARCHAR(500), -- URL where sponsorship information was found
    is_verified BOOLEAN DEFAULT false,
    submitted_by UUID, -- User ID who submitted this information
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users table for authentication and contributions
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user', -- 'user', 'moderator', 'admin'
    organization VARCHAR(255),
    is_verified BOOLEAN DEFAULT false,
    reputation_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Outreach templates for organizers
CREATE TABLE outreach_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    body TEXT NOT NULL,
    event_type VARCHAR(100),
    sponsorship_level VARCHAR(100),
    is_public BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Content moderation queue
CREATE TABLE moderation_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_type VARCHAR(50) NOT NULL, -- 'company', 'contact', 'sponsorship'
    content_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete'
    data JSONB NOT NULL, -- The actual content being moderated
    submitted_by UUID REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    reviewed_by UUID REFERENCES users(id),
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Search analytics
CREATE TABLE search_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query TEXT NOT NULL,
    filters JSONB, -- Search filters used
    results_count INTEGER,
    user_id UUID REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance optimization

-- Companies indexes
CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_companies_industry ON companies(industry);
CREATE INDEX idx_companies_size ON companies(size);
CREATE INDEX idx_companies_active ON companies(is_active);

-- Sponsorships indexes
CREATE INDEX idx_sponsorships_company ON sponsorships(company_id);
CREATE INDEX idx_sponsorships_year ON sponsorships(year);
CREATE INDEX idx_sponsorships_event_type ON sponsorships(event_type);
CREATE INDEX idx_sponsorships_verified ON sponsorships(is_verified);

-- Contacts indexes
CREATE INDEX idx_contacts_company ON sponsorship_contacts(company_id);
CREATE INDEX idx_contacts_verified ON sponsorship_contacts(is_verified);
CREATE INDEX idx_contacts_email ON sponsorship_contacts(email);

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_verified ON users(is_verified);

-- Analytics indexes
CREATE INDEX idx_search_analytics_created ON search_analytics(created_at);
CREATE INDEX idx_search_analytics_query ON search_analytics(query);

-- Full-text search indexes
CREATE INDEX idx_companies_search ON companies USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX idx_sponsorships_search ON sponsorships USING gin(to_tsvector('english', event_name));

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sponsorship_contacts_updated_at BEFORE UPDATE ON sponsorship_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sponsorships_updated_at BEFORE UPDATE ON sponsorships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_outreach_templates_updated_at BEFORE UPDATE ON outreach_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Initial seed data will be added in seed-data.sql
