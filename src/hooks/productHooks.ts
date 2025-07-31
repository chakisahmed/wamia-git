import axiosInstance from '../api/axiosConfig';
import { MAGE_TOKEN } from '@env';
import { ApolloError, gql, useQuery } from '@apollo/client';
import { getApolloClient } from '../api/apolloClient';
import { useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GET_PRODUCT_QUERY, GET_PRODUCTS } from '../graphql/queries';
  


export interface Product {
    price: any;
    id: string;
    sku: string;
    type_id: string;
    name: string;
    review_count: number;

    
    rating_summary: number;
    brand?: string;
    couleur?: number;
    size?: string;
    type_alimentation?: string;
    mode_expedition?:string;
    type_de_tissu?: string;
    category_id?: string;
    motif?: number;


    media_gallery: MediaGallery[];
    stock_status: string;
    price_range: ProductPrice;
    configurable_options: ConfigurableOption[] | null;
    variants: Variant[] | null;


}    
export interface Variant {
    product: Product;
}
export interface ProductsResponse {
    items: Product[];
    total_count: number;
}
export interface MediaGallery {
    url: string;
    label: string;
    position: number;
}
export interface ProductPrice {
    maximum_price: {
        regular_price: {
            currency: string;
            value: number;
        };
        final_price: {
            currency: string;
            value: number;
        };
    };
}
export interface ConfigurableOption {
    id: string;
    attribute_id: string;
    label: string;
    attribute_code: string;
    values: ConfigurableOptionValue[];
}
export interface ConfigurableOptionValue {
    label: string;
    value_index: number;
}

// export const useProducts = () => {
//     return useQuery(query, {
//       variables: {},
//     });
//   };



// 2. Create the custom hook


interface UseProductsParams {
  searchTerm?: string;
  page?: number;
  categoryId?: string | null;
  otherFilters?: Record<string, any>;
  pageSize?: number;
  sortBy?: Record<string, 'ASC' | 'DESC'>;
  skip?: boolean; // Add a skip option
  setRetryQueue?: React.Dispatch<React.SetStateAction<(() => Promise<void>)[]>>;
}
const isNetworkError = (error: ApolloError) => {
  return error.networkError !== null;
};
export const useProducts = ({
  searchTerm = "",
  page = 1,
  categoryId,
  otherFilters,
  pageSize = 20,
  sortBy,
  skip = false, // Default to not skipping
  setRetryQueue
}: UseProductsParams) => {

  

  const variables = useMemo(() => {
    const filter: Record<string, any> = {};
    if (categoryId) {
      filter.category_id = { in: categoryId };
    }
    const finalFilter = { ...filter, ...otherFilters };
    
    return {
      search: searchTerm,
      filter: finalFilter,
      currentPage: page,
      pageSize,
      sort: sortBy,
    };
  }, [searchTerm, page, categoryId, otherFilters, pageSize, sortBy]);

  const { data, loading, error, refetch, fetchMore } = useQuery<{ products: ProductsResponse }>(
    GET_PRODUCTS,
    {
      variables,
      skip, // Use the skip parameter here
      notifyOnNetworkStatusChange: true,
      errorPolicy: 'all', 
    }
  );

   useEffect(() => {
    // If there's an error, we have a setter function, and we're not in a loading state
    if (error && setRetryQueue && !loading) {
      if (isNetworkError(error)) {
        console.error('Apollo query failed due to network. Queuing refetch.');
        
        // The function we want to retry is `refetch`.
        // We wrap it to ensure it returns a promise.
        const refetchRequest = async () => {
          await refetch();
        };

        // Add it to the queue
        setRetryQueue(prevQueue => [...prevQueue, refetchRequest]);
      }
    }
  }, [error, loading, refetch, setRetryQueue]); // Dependencies for the effect

  return {
    productsData: data?.products,
    loading,
    error,
    refetch,
    fetchMore, // Useful for "load more" pagination
  };
};
export const useProductsIncludingSkus = ({ skus = [] } = {}) => {
  // This hook calls our generic useProducts hook with specific arguments
    const otherFilters = useMemo(() => {
    if (skus && skus.length > 0) {
      return { sku: { in: skus } };
    }
    return {};
  }, [skus]);
  const skip = skus === null || skus.length === 0;
  return useProducts({
    // Hardcoded values for "Best Sellers"

    pageSize: 20,
    page: 1, 
    sortBy: {}, // Or whatever sort order defines best sellers
    otherFilters,
    skip
  });
};


export const useBestSellerProducts = ({ skip = false } = {}) => {
  // This hook calls our generic useProducts hook with specific arguments
  return useProducts({
    // Hardcoded values for "Best Sellers"
    categoryId: "2957",
    pageSize: 20,
    page: 1, 
    sortBy: {}, // Or whatever sort order defines best sellers
    skip
  });

};
export const useNewestProducts = ({ skip = false} = {}) => {
  const products = useProducts({
    page:1,
    pageSize: 30,
    // Assuming newest products are sorted by creation date descending
    sortBy: {}, 
    skip
  });
  return products
};
export const useRecentlyViewedProducts = ({skip: externalSkip = false}= {}) => {
  const [skus, setSkus] = useState<string[] | null>(null);
  
  // 1. Effect to read SKUs from AsyncStorage when the hook mounts
  useEffect(() => {
    const getSkus = async () => {
      const recentlyViewed = await AsyncStorage.getItem('recentlyViewed');
      if (recentlyViewed) {
        setSkus(recentlyViewed.split(','));
      } else {
        setSkus([]); // Set to empty array if none found
      }
    };
    getSkus();
  }, []); // Empty dependency array means this runs once on mount

  // 2. Build the filter based on the retrieved SKUs
  const otherFilters = useMemo(() => {
    if (skus && skus.length > 0) {
      return { sku: { in: skus } };
    }
    return {};
  }, [skus]);

  const internalSkip = skus === null || skus.length === 0;
  // 3. Call useProducts, but skip the query until we have the SKUs
  return useProducts({
    otherFilters,
    pageSize: 20,
    // Skip the GraphQL query if `skus` is still null (i.e., we haven't checked storage yet)
    // or if the skus array is empty.
    // The query will be skipped if EITHER the external flag is true
    // OR the internal logic determines it should be skipped.
    skip: externalSkip || internalSkip,
  });
};

export const getProductImage = async (sku: string): Promise<string|null> => {
  try {
    const response = await axiosInstance.get(`/rest/default/V1/products/${sku}/media`, {headers: {Authorization: `Bearer ${MAGE_TOKEN}`}});
    const image = "https://www.wamia.tn/media/catalog/product"+response.data[0].file as string;
    return image;

  } catch (error) {
    throw Error("Error loading image")
    
  }
};

// 2. Create the custom hook
export const useProduct = (sku: string | undefined) => {
  const { data, loading, error } = useQuery<{ products: ProductsResponse }>(
    GET_PRODUCT_QUERY,
    {
      variables: { sku },
      // The `skip` option is very useful. It prevents the query from running
      // if the sku is not yet available (e.g., from a URL parameter).
      skip: !sku,
    }
  );

  // The query returns an array of items, but we only want the first one.
  // useMemo helps extract this value efficiently.
  const product = useMemo(() => data?.products?.items?.[0], [data]);

  return {
    product,
    loading,
    error,
  };
};


export const getProductRest = async (sku: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/rest/default/V1/products/${sku}`, {headers: {
      Authorization : `Bearer ${MAGE_TOKEN}`
    }});
    const product = response.data;
    return product;
  } catch (error) {
    console.error('Error fetching product rest:', error);
    throw error;
  }
};   
export const getProductById = async (productId: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/rest/default/V1/products?searchCriteria`+
      `[filterGroups][0][filters][0][field]=entity_id`+
      `&searchCriteria[filterGroups][0][filters][0][condition_type]=eq`+
      `&searchCriteria[filterGroups][0][filters][0][value]=${productId}`, {headers: {
      Authorization
      : `Bearer ${MAGE_TOKEN}`
    }});
    const product = response.data;
    return product;
  } catch (error) {
    console.error('Error fetching product:', error.message);
    throw Error("Error getting product");
  }
}
export const getProductsAttributeSet = async (attributeSetId: any): Promise<any> => {  
  try {
    const response = await axiosInstance.get(`/rest/V1/products/attribute-sets/${attributeSetId}/attributes`, {headers: {
      Authorization
      : `Bearer ${MAGE_TOKEN}`
    }});
    const attributeSets = response.data;
    return attributeSets;
  } catch (error) {
    console.error('Error fetching products:', error.response.data);
    throw Error("Error getting attribute set");
  }
}
export interface ModeExpedition{
    key:string
}
export const getAttributeValues = async (attributeCode: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/rest/V1/products/attributes/${attributeCode}/options`, {headers: {
      Authorization
      : `Bearer ${MAGE_TOKEN}`
    }});
    const attributeValues = response.data;
    if(attributeCode!="mode_expedition")return attributeValues
    const attributesMap: Record<string, string> = {}; // <-- Here's the fix
attributeValues.forEach((element: any) => { // Consider typing 'element' more strictly
  attributesMap[element.value] = element.label;
});
    return attributesMap;
  } catch (error) {
    console.error('Error fetching attributes values for ', attributeCode," : ", error);
    throw error;
  }

}


