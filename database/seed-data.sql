-- SponsorBase Seed Data
-- Initial data for the SponsorBase database

-- Insert initial categories
INSERT INTO categories (name, description) VALUES
('Technology', 'Software, hardware, and tech services companies'),
('Finance', 'Banks, fintech, and financial services'),
('Healthcare', 'Medical devices, pharma, and healthcare services'),
('Education', 'EdTech, schools, and educational institutions'),
('Retail', 'E-commerce, brick-and-mortar retail'),
('Media', 'News, entertainment, and content companies'),
('Consulting', 'Business consulting and professional services'),
('Manufacturing', 'Industrial and manufacturing companies'),
('Non-profit', 'Charitable organizations and foundations'),
('Government', 'Government agencies and public sector'),
('Startup', 'Early-stage and growth-stage startups'),
('Enterprise', 'Large established corporations'),
('Local Business', 'Regional and local companies'),
('Venture Capital', 'VC firms and investment companies'),
('Other', 'Miscellaneous categories');

-- Insert sample companies (real tech companies known to sponsor events)
INSERT INTO companies (name, description, website, industry, country) VALUES
('Notion', 'All-in-one workspace for notes, tasks, wikis, and databases.', 'https://www.notion.so', 'Productivity Software', 'USA'),
('Google', 'Technology company specializing in Internet-related services and products.', 'https://www.google.com', 'Technology', 'USA'),
('Microsoft', 'Technology company that develops, manufactures, licenses, and supports software products.', 'https://www.microsoft.com', 'Technology', 'USA'),
('Amazon', 'E-commerce and cloud computing company.', 'https://www.amazon.com', 'Technology', 'USA'),
('Meta', 'Technology company that builds social media and communication tools.', 'https://www.meta.com', 'Technology', 'USA'),
('Apple', 'Technology company that designs, develops, and sells consumer electronics.', 'https://www.apple.com', 'Technology', 'USA'),
('Netflix', 'Streaming entertainment service provider.', 'https://www.netflix.com', 'Media', 'USA'),
('Tesla', 'Electric vehicle and clean energy company.', 'https://www.tesla.com', 'Manufacturing', 'USA'),
('Salesforce', 'Cloud-based software company specializing in customer relationship management.', 'https://www.salesforce.com', 'Technology', 'USA'),
('Stripe', 'Technology company that builds economic infrastructure for the internet.', 'https://stripe.com', 'Finance', 'USA'),
('GitHub', 'Platform for hosting and collaborating on software development projects.', 'https://github.com', 'Technology', 'USA'),
('Twilio', 'Cloud communications platform enabling developers to build communication experiences.', 'https://www.twilio.com', 'Technology', 'USA'),
('Slack', 'Business communication platform.', 'https://slack.com', 'Technology', 'USA'),
('Airbnb', 'Online marketplace for lodging and tourism experiences.', 'https://www.airbnb.com', 'Technology', 'USA'),
('Uber', 'Transportation network company.', 'https://www.uber.com', 'Technology', 'USA'),
('LinkedIn', 'Professional networking and career development platform.', 'https://www.linkedin.com', 'Technology', 'USA'),
('Twitter', 'Social media and news platform.', 'https://twitter.com', 'Media', 'USA'),
('Reddit', 'Social news aggregation and discussion platform.', 'https://www.reddit.com', 'Media', 'USA'),
('Dropbox', 'File hosting service and cloud storage.', 'https://www.dropbox.com', 'Technology', 'USA'),
('Spotify', 'Audio streaming and media services provider.', 'https://www.spotify.com', 'Media', 'Sweden'),
('Adobe', 'Software company specializing in creativity and multimedia products.', 'https://www.adobe.com', 'Technology', 'USA');

-- Link companies to categories
INSERT INTO company_categories (company_id, category_id) 
SELECT c.id, cat.id 
FROM companies c, categories cat 
WHERE c.name IN ('Google', 'Microsoft', 'Amazon', 'Meta', 'Apple') AND cat.name = 'Technology';

INSERT INTO company_categories (company_id, category_id) 
SELECT c.id, cat.id 
FROM companies c, categories cat 
WHERE c.name IN ('Netflix', 'Twitter', 'Reddit', 'Spotify') AND cat.name = 'Media';

INSERT INTO company_categories (company_id, category_id) 
SELECT c.id, cat.id 
FROM companies c, categories cat 
WHERE c.name = 'Stripe' AND cat.name = 'Finance';

INSERT INTO company_categories (company_id, category_id) 
SELECT c.id, cat.id 
FROM companies c, categories cat 
WHERE c.name = 'Tesla' AND cat.name = 'Manufacturing';

-- Insert sample contacts
INSERT INTO contacts (company_id, email, department, source) VALUES
((SELECT id FROM companies WHERE name = 'Notion'), 'partnerships@notion.so', 'partnerships', 'public website'),
((SELECT id FROM companies WHERE name = 'Notion'), 'marketing@notion.so', 'marketing', 'public website'),
((SELECT id FROM companies WHERE name = 'Notion'), 'community@notion.so', 'community', 'public website'),
((SELECT id FROM companies WHERE name = 'Google'), 'devrel@google.com', 'developer relations', 'public website'),
((SELECT id FROM companies WHERE name = 'Microsoft'), 'devrel@microsoft.com', 'developer relations', 'public website'),
((SELECT id FROM companies WHERE name = 'GitHub'), 'sponsorships@github.com', 'sponsorships', 'public website'),
((SELECT id FROM companies WHERE name = 'Stripe'), 'devrel@stripe.com', 'developer relations', 'public website'),
((SELECT id FROM companies WHERE name = 'Twilio'), 'devrel@twilio.com', 'developer education', 'public website');

-- Insert sample sponsorship history
INSERT INTO sponsorships (company_id, event_name, event_type, sponsorship_level, amount_range, year, source_url, is_verified) VALUES
((SELECT id FROM companies WHERE name = 'Google'), 'Google Summer of Code', 'hackathon', 'Platinum', '$10,000+', 2023, 'https://summerofcode.withgoogle.com/', true),
((SELECT id FROM companies WHERE name = 'Microsoft'), 'Microsoft Hackathon', 'hackathon', 'Gold', '$5,000-$10,000', 2023, 'https://www.microsoft.com/en-us/hackathon', true),
((SELECT id FROM companies WHERE name = 'GitHub'), 'GitHub Universe', 'conference', 'Platinum', '$10,000+', 2023, 'https://githubuniverse.com/', true),
((SELECT id FROM companies WHERE name = 'Stripe'), 'Stripe Sessions', 'conference', 'Gold', '$5,000-$10,000', 2023, 'https://stripe.com/sessions', true),
((SELECT id FROM companies WHERE name = 'Twilio'), 'Twilio SIGNAL', 'conference', 'Silver', '$1,000-$5,000', 2023, 'https://www.twilio.com/signal', true),
((SELECT id FROM companies WHERE name = 'Google'), 'DevFest', 'meetup', 'Bronze', '$500-$1,000', 2023, 'https://devfest.withgoogle.com/', true),
((SELECT id FROM companies WHERE name = 'Microsoft'), 'Build Developer Conference', 'conference', 'Platinum', '$10,000+', 2023, 'https://build.microsoft.com/', true),
((SELECT id FROM companies WHERE name = 'GitHub'), 'GitHub Satellite', 'conference', 'Gold', '$5,000-$10,000', 2023, 'https://satellite.github.com/', true);

-- Insert sample outreach templates
INSERT INTO outreach_templates (name, subject, body, event_type, sponsorship_level, is_public) VALUES
('Hackathon Sponsorship Request', 'Partnership Opportunity: [Event Name] Hackathon 2024', 
'Dear [Contact Name],

I hope this email finds you well. My name is [Your Name] and I''m organizing the [Event Name] Hackathon 2024, a [duration] hackathon bringing together [number] talented developers and innovators.

Our event aims to [event goal], and we believe [Company Name]''s commitment to [company value] aligns perfectly with our mission. We''re seeking [sponsorship level] partners to help us create an exceptional experience for our participants.

As a [sponsorship level] sponsor, [Company Name] would receive:
- Logo placement on all event materials and website
- Speaking opportunity during opening/closing ceremonies
- Dedicated booth space for recruitment and product demos
- Mentoring opportunities with participants
- Social media recognition across our channels

We''re expecting [number] participants from [geographic area], representing [universities/companies]. This is an excellent opportunity to connect with emerging talent and showcase [Company Name]''s innovative solutions.

Would you be available for a brief call next week to discuss this partnership opportunity further?

Thank you for your consideration.

Best regards,
[Your Name]
[Your Title]
[Event Name] Hackathon 2024
[Your Email]
[Event Website]', 'hackathon', 'Gold', true),

('Conference Partnership Proposal', 'Sponsorship Opportunity: [Conference Name] 2024', 
'Dear [Contact Name],

I hope this message finds you well. I''m reaching out from [Conference Name], an annual [industry] conference that brings together [number] professionals, thought leaders, and innovators.

This year''s conference, taking place [dates] at [venue], will focus on [conference theme]. Given [Company Name]''s leadership in [relevant field], we believe this would be an excellent partnership opportunity.

We''re offering several sponsorship levels, with our [sponsorship level] package including:
- Premium booth location in high-traffic area
- Speaking slot in main conference track
- Branding on conference app and materials
- VIP access to networking events
- Lead generation through attendee scanning
- Post-conference attendee list (opt-in only)

Last year''s conference attracted [number] attendees from [number] companies, with [percentage] C-suite or director-level executives. Our audience represents a highly valuable demographic for [Company Name]''s [products/services].

I''d love to schedule a call to discuss how we can create a mutually beneficial partnership. Would [specific dates/times] work for you?

Looking forward to exploring this opportunity.

Best regards,
[Your Name]
[Your Title]
[Conference Name] 2024
[Your Email]
[Conference Website]', 'conference', 'Platinum', true);

-- Insert sample admin user (password: admin123 - should be changed in production)
INSERT INTO users (email, password_hash, name, role, is_verified, reputation_score) VALUES
('admin@sponsorbase.com', '$2b$10$dummy_hash_for_admin123', 'Admin User', 'admin', true, 1000);

-- Insert sample regular users
INSERT INTO users (email, password_hash, name, organization, role, is_verified, reputation_score) VALUES
('organizer@hackathon.com', '$2b$10$dummy_hash_for_password', 'Event Organizer', 'Tech Community', 'user', true, 250),
('developer@company.com', '$2b$10$dummy_hash_for_password', 'John Developer', 'Startup Inc', 'user', false, 50);

-- Note: In a real application, password hashes should be properly generated using bcrypt
-- These are placeholder hashes and should be replaced with actual bcrypt hashes
