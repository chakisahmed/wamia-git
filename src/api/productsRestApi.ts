import { MAGE_TOKEN } from '@env';

/**
 * Example Response Interface for REST
 * (Modify to match your needs and transform the result as needed)
 */
export interface Product {
    id?: number;
    sku?: string;
    name?: string;
    type_id?: string;
    price?: number; // Magento often returns 0 for configurables
    // Child products or any custom field you want to store
    children?: Product[];
  
    // Use custom_attributes to retrieve any additional data
    // like special_price, etc. if returned by your Magento setup.
    custom_attributes?: Array<{
      attribute_code: string;
      value: string;
    }>;
  }
  
  export interface ProductsResponse {
    items: Product[];
    total_count: number;
    // search_criteria?: any; // Magento also returns the applied search criteria
  }
  
  /**
   * Translated getProducts function using Magento 2 REST API /rest/V1/products
   * PLUS fetching configurable children to get correct pricing.
   */
  export const getProductsRestApi = async (
    searchTerm: string,
    page: number,
    categoryId: string | null,
    otherFilters?: any,
    pageSize: number = 50,
    sortBy?: string // e.g. 'name', 'price', etc.
  ): Promise<ProductsResponse> => {
    // 1) Primary products call
    const baseUrl = 'https://www.wamia.tn/rest/V1/products';
    const accessToken = MAGE_TOKEN; // Bearer token
  
    /**
     * Build filterGroups
     */
    const filterGroups: {
      filters: Array<{
        field: string;
        value: string;
        conditionType: string;
      }>;
    }[] = [];
  
    // If you want to filter by name "like" your search term:
    if (searchTerm) {
      filterGroups.push({
        filters: [
          {
            field: 'name',
            // Using the 'like' condition with wildcards
            value: `%${searchTerm}%`,
            conditionType: 'like',
          },
        ],
      });
    }
  
    // If you want to filter by category_id:
    if (categoryId) {
      filterGroups.push({
        filters: [
          {
            field: 'category_id',
            value: categoryId,
            conditionType: 'eq',
          },
        ],
      });
    }
  
    // Optionally handle otherFilters (transform them into filterGroups as needed)
    // E.g., if otherFilters = { color: 'Red' }, you'd push another filterGroup.
  
    // Construct the URL with query parameters
    const url = new URL(baseUrl);
  
    // Pagination
    url.searchParams.append('searchCriteria[currentPage]', page.toString());
    url.searchParams.append('searchCriteria[pageSize]', pageSize.toString());
  
    // Add each filter group & filter
    filterGroups.forEach((group, groupIndex) => {
      group.filters.forEach((filter, filterIndex) => {
        url.searchParams.append(
          `searchCriteria[filterGroups][${groupIndex}][filters][${filterIndex}][field]`,
          filter.field
        );
        url.searchParams.append(
          `searchCriteria[filterGroups][${groupIndex}][filters][${filterIndex}][value]`,
          filter.value
        );
        url.searchParams.append(
          `searchCriteria[filterGroups][${groupIndex}][filters][${filterIndex}][conditionType]`,
          filter.conditionType
        );
      });
    });
  
    // Sort by (example: sort by 'name' ascending)
    if (sortBy) {
      url.searchParams.append('searchCriteria[sortOrders][0][field]', sortBy);
      // direction could be 'ASC' or 'DESC'
      url.searchParams.append('searchCriteria[sortOrders][0][direction]', 'ASC');
    }
  
    // Perform the fetch
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Pass your token here
        Authorization: `Bearer ${accessToken}`,
      },
    });
  
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
    }
  
    const data = await response.json();
  
    // 2) Post-process items to fetch child products for configurables
    const itemsWithPrices = await Promise.all(
      data.items.map(async (item: Product) => {
        if (item.type_id === 'configurable' && item.sku) {
          // Fetch child products to retrieve correct prices
          const childrenUrl = `https://www.wamia.tn/rest/V1/configurable-products/${encodeURIComponent(
            item.sku
          )}/children`;
  
          try {
            const childResp = await fetch(childrenUrl, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
              },
            });
  
            if (!childResp.ok) {
              // Not strictly necessary to throw an error if children can't be fetched;
              // depends on how you want to handle partial data.
              throw new Error(`Failed to fetch children for SKU ${item.sku}`);
            }
  
            const childrenData: Product[] = await childResp.json();
            item.children = childrenData;
  
            // OPTIONAL: you can compute minimum or maximum price from children
            // Assuming 'price' is the integer field in the child product
            // or a custom attribute. Adjust logic to your store’s data structure.
  
            if (childrenData.length > 0) {
              // Example: compute minimum child price
              const prices = childrenData
                .map((child) => (child.price ? child.price : 0))
                .filter((p) => p > 0);
  
              // For demonstration, we’ll assume:
              const minPrice = Math.min(...prices);
              if (isFinite(minPrice)) {
                // You could store it on the parent product or in a custom field:
                item.price = minPrice; // Set the parent’s price to the child’s min price
              }
            }
          } catch (err) {
            console.error(`Error fetching children for ${item.sku}:`, err);
          }
        }
  
        return item;
      })
    );
  
    // Return final data with extended info
    return {
      items: itemsWithPrices,
      total_count: data.total_count,
    };
  };
  