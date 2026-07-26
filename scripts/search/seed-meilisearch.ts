import { setupMeilisearchIndexes } from '../../backend/services/meilisearch.service';
import { SearchSyncService } from '../../backend/services/search-sync.service';

const seedMeilisearch = async () => {
  console.log('Starting Meilisearch indexing & seeding...');

  try {
    // 1. Establish index schemas
    await setupMeilisearchIndexes();
    console.log('Meilisearch index configurations completed successfully.');

    // 2. Feed initial seed data matching seed-data.sql
    const initialCompanies = [
      {
        id: 1,
        name: 'Notion',
        website: 'https://notion.so',
        industry: 'Productivity Software',
        country: 'USA',
        tags: ['wiki', 'docs', 'notes', 'sponsorship'],
        is_verified: true,
        sponsorship_count: 1
      },
      {
        id: 2,
        name: 'DigitalOcean',
        website: 'https://digitalocean.com',
        industry: 'Cloud Computing',
        country: 'USA',
        tags: ['cloud', 'hosting', 'infrastructure', 'droplet'],
        is_verified: true,
        sponsorship_count: 1
      },
      {
        id: 3,
        name: 'Polygon',
        website: 'https://polygon.technology',
        industry: 'Blockchain',
        country: 'India',
        tags: ['crypto', 'l2', 'web3', 'scaling'],
        is_verified: false,
        sponsorship_count: 0
      }
    ];

    await SearchSyncService.bulkSyncCompanies(initialCompanies);
    console.log('Initial sample companies successfully uploaded to Meilisearch index.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding Meilisearch:', error);
    process.exit(1);
  }
};

seedMeilisearch();
