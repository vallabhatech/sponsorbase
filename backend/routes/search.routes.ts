import { Router, Request, Response } from 'express';
import { meiliClient, setupMeilisearchIndexes } from '../services/meilisearch.service';
import { SearchSyncService } from '../services/search-sync.service';

const router = Router();
const index = meiliClient.index('companies');

router.get('/companies', async (req: Request, res: Response) => {
  const { q, industry, country, level, sort, limit, offset } = req.query;

  try {
    const searchParams: any = {
      limit: limit ? parseInt(limit as string, 10) : 20,
      offset: offset ? parseInt(offset as string, 10) : 0,
      facets: ['industry', 'country', 'sponsorship_level', 'is_verified'],
    };

    const filterList: string[] = [];

    if (industry) {
      filterList.push(`industry = "${industry}"`);
    }
    if (country) {
      filterList.push(`country = "${country}"`);
    }
    if (level) {
      filterList.push(`sponsorship_level = "${level}"`);
    }

    if (filterList.length > 0) {
      searchParams.filter = filterList.join(' AND ');
    }

    if (sort) {
      const sortStr = sort as string;
      const desc = sortStr.startsWith('-');
      const field = desc ? sortStr.substring(1) : sortStr;
      searchParams.sort = [`${field}:${desc ? 'desc' : 'asc'}`];
    }

    const results = await index.search(q as string || '', searchParams);

    return res.json({
      hits: results.hits,
      total: results.estimatedTotalHits,
      limit: results.limit,
      offset: results.offset,
      processingTimeMs: results.processingTimeMs,
      facets: results.facetDistribution
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Search Error', message: error.message });
  }
});

router.get('/companies/facets', async (req: Request, res: Response) => {
  try {
    // Perform empty search to fetch global facet distributions
    const results = await index.search('', {
      limit: 0,
      facets: ['industry', 'country', 'sponsorship_level', 'is_verified']
    });

    return res.json({
      facets: results.facetDistribution
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Facet Error', message: error.message });
  }
});

router.post('/reindex', async (req: Request, res: Response) => {
  // In production, ensure authMiddleware and roleGuard are run before this route
  try {
    await setupMeilisearchIndexes();

    // In production, query the actual database to fetch all companies
    const mockCompanies = [
      { id: 1, name: 'Notion', website: 'https://notion.so', industry: 'Productivity Software', country: 'USA', tags: ['docs', 'wiki', 'notes'], is_verified: true, sponsorship_count: 1 },
      { id: 2, name: 'DigitalOcean', website: 'https://digitalocean.com', industry: 'Cloud Computing', country: 'USA', tags: ['vps', 'droplet', 'cloud'], is_verified: true, sponsorship_count: 1 },
      { id: 3, name: 'Polygon', website: 'https://polygon.technology', industry: 'Blockchain', country: 'India', tags: ['crypto', 'web3', 'l2'], is_verified: false, sponsorship_count: 0 }
    ];

    await SearchSyncService.bulkSyncCompanies(mockCompanies);

    return res.json({ message: 'Re-index triggered successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Re-index Error', message: error.message });
  }
});

export default router;
