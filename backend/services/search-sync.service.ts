import { meiliClient } from './meilisearch.service';

export interface CompanySyncData {
  id: string | number;
  name: string;
  description?: string;
  industry?: string;
  country?: string;
  tags?: string[];
  is_verified?: boolean;
  sponsorship_count?: number;
  created_at?: Date | string;
}

export class SearchSyncService {
  private static index = meiliClient.index('companies');

  /**
   * Syncs a single company creation or update to Meilisearch.
   */
  static async syncCompany(company: CompanySyncData): Promise<void> {
    try {
      await this.index.addDocuments([{
        id: String(company.id),
        name: company.name,
        description: company.description || '',
        industry: company.industry || '',
        country: company.country || '',
        tags: company.tags || [],
        is_verified: !!company.is_verified,
        sponsorship_count: company.sponsorship_count || 0,
        created_at: company.created_at ? new Date(company.created_at).toISOString() : new Date().toISOString()
      }]);
      console.log(`Successfully synced company to Meilisearch index: ${company.id}`);
    } catch (error) {
      console.error(`Failed to sync company ${company.id} to Meilisearch:`, error);
    }
  }

  /**
   * Deletes a company from the Meilisearch index.
   */
  static async removeCompany(companyId: string | number): Promise<void> {
    try {
      await this.index.deleteDocument(String(companyId));
      console.log(`Successfully removed company from Meilisearch index: ${companyId}`);
    } catch (error) {
      console.error(`Failed to remove company ${companyId} from Meilisearch:`, error);
    }
  }

  /**
   * Bulk syncs multiple companies. Handy for database seed/startup processes.
   */
  static async bulkSyncCompanies(companies: CompanySyncData[]): Promise<void> {
    try {
      const documents = companies.map(company => ({
        id: String(company.id),
        name: company.name,
        description: company.description || '',
        industry: company.industry || '',
        country: company.country || '',
        tags: company.tags || [],
        is_verified: !!company.is_verified,
        sponsorship_count: company.sponsorship_count || 0,
        created_at: company.created_at ? new Date(company.created_at).toISOString() : new Date().toISOString()
      }));
      
      const task = await this.index.addDocuments(documents);
      console.log(`Bulk sync task queued in Meilisearch with Task UID: ${task.taskUid}`);
    } catch (error) {
      console.error('Failed bulk syncing companies to Meilisearch:', error);
    }
  }
}
