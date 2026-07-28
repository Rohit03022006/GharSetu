import { Client } from '@opensearch-project/opensearch';
import { logger } from '../utils/logger.js';

const nodeUrl = process.env.OPENSEARCH_NODE;

export const openSearchClient = new Client({
  node: nodeUrl
});

export const PROPERTY_INDEX = 'properties';

/**
 * Initialize OpenSearch Index with Mappings & Filters
 */
export const initOpenSearchIndex = async () => {
  try {
    const exists = await openSearchClient.indices.exists({ index: PROPERTY_INDEX });
    
    if (!exists.body) {
      await openSearchClient.indices.create({
        index: PROPERTY_INDEX,
        body: {
          mappings: {
            properties: {
              id: { type: 'keyword' },
              title: { type: 'text', analyzer: 'standard' },
              description: { type: 'text' },
              city: { type: 'keyword' },
              state: { type: 'keyword' },
              price: { type: 'double' },
              areaSqFt: { type: 'double' },
              bedrooms: { type: 'integer' },
              bathrooms: { type: 'integer' },
              propertyType: { type: 'keyword' },
              listingType: { type: 'keyword' },
              constructionStatus: { type: 'keyword' },
              status: { type: 'keyword' },
              createdAt: { type: 'date' }
            }
          }
        }
      });
      logger.info(`OpenSearch index '${PROPERTY_INDEX}' created successfully.`);
    }
  } catch (error) {
    logger.warn('OpenSearch connection warning (Falling back to PostgreSQL & Redis):', error.message);
  }
};

/**
 * Index a property document into OpenSearch
 */
export const indexPropertyDocument = async (property) => {
  try {
    await openSearchClient.index({
      index: PROPERTY_INDEX,
      id: property.id,
      body: {
        id: property.id,
        title: property.title,
        description: property.description,
        city: property.city,
        state: property.state,
        price: property.price,
        areaSqFt: property.areaSqFt,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        propertyType: property.propertyType,
        listingType: property.listingType,
        constructionStatus: property.constructionStatus,
        status: property.status,
        createdAt: property.createdAt
      },
      refresh: true
    });
  } catch (error) {
    logger.warn(`Failed to index property ${property.id} in OpenSearch:`, error.message);
  }
};
