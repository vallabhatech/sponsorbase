import { MeiliSearch } from 'meilisearch';

const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST || 'http://localhost:7700';
const MEILISEARCH_API_KEY = process.env.MEILISEARCH_API_KEY || 'masterKey';

export const meiliClient = new MeiliSearch({
  host: MEILISEARCH_HOST,
  apiKey: MEILISEARCH_API_KEY,
});

export const setupMeilisearchIndexes = async () => {
  const index = meiliClient.index('companies');
  
  await meiliClient.createIndex('companies', { primaryKey: 'id' }).catch(() => {
    // Index might already exist, which is fine
  });

  await index.updateFilterableAttributes([
    'industry',
    'country',
    'sponsorship_level',
    'is_verified'
  ]);

  await index.updateSortableAttributes([
    'name',
    'created_at',
    'sponsorship_count'
  ]);

  await index.updateSearchableAttributes([
    'name',
    'description',
    'industry',
    'tags'
  ]);

  await index.updateRankingRules([
    'words',
    'typo',
    'proximity',
    'attribute',
    'sort',
    'exactness'
  ]);
};
