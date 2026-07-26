import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');

  // Create Users
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@sponsorbase.com',
      passwordHash: '$2b$10$dummy_hash_for_admin123',
      name: 'Admin User',
      role: 'admin',
      isVerified: true,
      reputationScore: 1000
    }
  });

  const orgUser = await prisma.user.create({
    data: {
      email: 'organizer@hackathon.com',
      passwordHash: '$2b$10$dummy_hash_for_password',
      name: 'Event Organizer',
      organization: 'Tech Community',
      role: 'user',
      isVerified: true,
      reputationScore: 250
    }
  });

  const devUser = await prisma.user.create({
    data: {
      email: 'developer@company.com',
      passwordHash: '$2b$10$dummy_hash_for_password',
      name: 'John Developer',
      organization: 'Startup Inc',
      role: 'user',
      isVerified: false,
      reputationScore: 50
    }
  });

  // Companies
  const notion = await prisma.company.create({
    data: { name: 'Notion', website: 'https://notion.so', industry: 'Productivity Software', country: 'USA' }
  });
  
  const digitalOcean = await prisma.company.create({
    data: { name: 'DigitalOcean', website: 'https://digitalocean.com', industry: 'Cloud Computing', country: 'USA' }
  });

  const polygon = await prisma.company.create({
    data: { name: 'Polygon', website: 'https://polygon.technology', industry: 'Blockchain', country: 'India' }
  });
  
  const google = await prisma.company.create({
    data: { name: 'Google', website: 'https://google.com', industry: 'Technology', country: 'USA' }
  });

  const microsoft = await prisma.company.create({
    data: { name: 'Microsoft', website: 'https://microsoft.com', industry: 'Technology', country: 'USA' }
  });

  const github = await prisma.company.create({
    data: { name: 'GitHub', website: 'https://github.com', industry: 'Technology', country: 'USA' }
  });
  
  const stripe = await prisma.company.create({
    data: { name: 'Stripe', website: 'https://stripe.com', industry: 'Fintech', country: 'USA' }
  });

  const twilio = await prisma.company.create({
    data: { name: 'Twilio', website: 'https://twilio.com', industry: 'Cloud Communications', country: 'USA' }
  });

  // Contacts
  await prisma.contact.createMany({
    data: [
      { companyId: notion.id, email: 'partnerships@notion.so', department: 'Partnerships', source: 'Public Website' },
      { companyId: digitalOcean.id, email: 'community@digitalocean.com', department: 'Community', source: 'Developer Program' }
    ]
  });

  // Events
  await prisma.event.createMany({
    data: [
      { companyId: notion.id, eventName: 'HackMIT', year: 2024, location: 'USA' },
      { companyId: digitalOcean.id, eventName: 'ETHGlobal', year: 2023, location: 'Global' }
    ]
  });

  // Sponsorships
  await prisma.sponsorship.createMany({
    data: [
      { companyId: google.id, eventName: 'Google Summer of Code', eventType: 'hackathon', sponsorshipLevel: 'Platinum', amountRange: '$10,000+', year: 2023, sourceUrl: 'https://summerofcode.withgoogle.com/', isVerified: true },
      { companyId: microsoft.id, eventName: 'Microsoft Hackathon', eventType: 'hackathon', sponsorshipLevel: 'Gold', amountRange: '$5,000-$10,000', year: 2023, sourceUrl: 'https://www.microsoft.com/en-us/hackathon', isVerified: true },
      { companyId: github.id, eventName: 'GitHub Universe', eventType: 'conference', sponsorshipLevel: 'Platinum', amountRange: '$10,000+', year: 2023, sourceUrl: 'https://githubuniverse.com/', isVerified: true },
      { companyId: stripe.id, eventName: 'Stripe Sessions', eventType: 'conference', sponsorshipLevel: 'Gold', amountRange: '$5,000-$10,000', year: 2023, sourceUrl: 'https://stripe.com/sessions', isVerified: true },
      { companyId: twilio.id, eventName: 'Twilio SIGNAL', eventType: 'conference', sponsorshipLevel: 'Silver', amountRange: '$1,000-$5,000', year: 2023, sourceUrl: 'https://www.twilio.com/signal', isVerified: true },
      { companyId: google.id, eventName: 'DevFest', eventType: 'meetup', sponsorshipLevel: 'Bronze', amountRange: '$500-$1,000', year: 2023, sourceUrl: 'https://devfest.withgoogle.com/', isVerified: true },
      { companyId: microsoft.id, eventName: 'Build Developer Conference', eventType: 'conference', sponsorshipLevel: 'Platinum', amountRange: '$10,000+', year: 2023, sourceUrl: 'https://build.microsoft.com/', isVerified: true },
      { companyId: github.id, eventName: 'GitHub Satellite', eventType: 'conference', sponsorshipLevel: 'Gold', amountRange: '$5,000-$10,000', year: 2023, sourceUrl: 'https://satellite.github.com/', isVerified: true }
    ]
  });

  // Outreach Templates
  await prisma.outreachTemplate.createMany({
    data: [
      {
        name: 'Hackathon Sponsorship Request',
        subject: 'Partnership Opportunity: [Event Name] Hackathon 2024',
        body: `Dear [Contact Name],\n\nI hope this email finds you well. My name is [Your Name] and I'm organizing the [Event Name] Hackathon 2024, a [duration] hackathon bringing together [number] talented developers and innovators.\n\nOur event aims to [event goal], and we believe [Company Name]'s commitment to [company value] aligns perfectly with our mission. We're seeking [sponsorship level] partners to help us create an exceptional experience for our participants.\n\nAs a [sponsorship level] sponsor, [Company Name] would receive:\n- Logo placement on all event materials and website\n- Speaking opportunity during opening/closing ceremonies\n- Dedicated booth space for recruitment and product demos\n- Mentoring opportunities with participants\n- Social media recognition across our channels\n\nWe're expecting [number] participants from [geographic area], representing [universities/companies]. This is an excellent opportunity to connect with emerging talent and showcase [Company Name]'s innovative solutions.\n\nWould you be available for a brief call next week to discuss this partnership opportunity further?\n\nThank you for your consideration.\n\nBest regards,\n[Your Name]\n[Your Title]\n[Event Name] Hackathon 2024\n[Your Email]\n[Event Website]`,
        eventType: 'hackathon',
        sponsorshipLevel: 'Gold',
        isPublic: true
      },
      {
        name: 'Conference Partnership Proposal',
        subject: 'Sponsorship Opportunity: [Conference Name] 2024',
        body: `Dear [Contact Name],\n\nI hope this message finds you well. I'm reaching out from [Conference Name], an annual [industry] conference that brings together [number] professionals, thought leaders, and innovators.\n\nThis year's conference, taking place [dates] at [venue], will focus on [conference theme]. Given [Company Name]'s leadership in [relevant field], we believe this would be an excellent partnership opportunity.\n\nWe're offering several sponsorship levels, with our [sponsorship level] package including:
- Premium booth location in high-traffic area
- Speaking slot in main conference track
- Branding on conference app and materials
- VIP access to networking events
- Lead generation through attendee scanning
- Post-conference attendee list (opt-in only)

Last year's conference attracted [number] attendees from [number] companies, with [percentage] C-suite or director-level executives. Our audience represents a highly valuable demographic for [Company Name]'s [products/services].

I'd love to schedule a call to discuss how we can create a mutually beneficial partnership. Would [specific dates/times] work for you?

Looking forward to exploring this opportunity.

Best regards,
[Your Name]
[Your Title]
[Conference Name] 2024
[Your Email]
[Conference Website]`,
        eventType: 'conference',
        sponsorshipLevel: 'Platinum',
        isPublic: true
      }
    ]
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
