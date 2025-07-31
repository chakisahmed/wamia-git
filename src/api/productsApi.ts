import { useQuery, gql } from '@apollo/client';
import axiosInstance from './axiosConfig';
import { getApolloClient } from './apolloClient';
import { MAGE_TOKEN } from '@env';
  
//import { MAGE_TOKEN } from '@env';


export interface CustomAttribute {
  [key: string]: string;
}
//export interface ModeExpedition{

export interface Product {
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


export const getProducts = async (searchTerm: string, page: number, categoryId: any,otherFilters?:any,pageSize?: number,sortBy?:string): Promise<ProductsResponse> => {
  const queryString=`
    {
      products(
        search: "${searchTerm}"
        filter: { ${categoryId != null && categoryId !== "" ? `category_id: { in: "${categoryId}" }` : ""} ${otherFilters ? otherFilters : ""} }
        currentPage: ${page}
        pageSize: ${pageSize || 100}
        sort: { ${sortBy ?? ''} }
      ) {
        total_count
        items {
          id
          name
          review_count
          rating_summary
          sku
          special_price
          mode_expedition

          couleur
          brand
          type_alimentation
          review_count
          type_de_tissu
          size

          
          media_gallery {
            url
          }
          stock_status
          price_range {
            maximum_price {
              regular_price {
                currency
                value
              }
              final_price {
                currency
                value
              }
            }
          }
          ... on ConfigurableProduct {
            configurable_options {
              id
              attribute_id
              label
              attribute_code
              values {
                label
                value_index
              }
            }
          }
        }
      }
    }
  `;
  const query = gql`${queryString}`;
  try {
    const client = getApolloClient();
    const response = await client.query({
      query,
    });
    return response.data.products as ProductsResponse;

  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};
export const getProductImage = async (sku: string): Promise<string|null> => {
  try {
    const response = await axiosInstance.get(`/rest/default/V1/products/${sku}/media`, {headers: {Authorization: `Bearer ${MAGE_TOKEN}`}});
    const image = "https://www.wamia.tn/media/catalog/product"+response.data[0].file as string;
    return image;

  } catch (error) {
    
  }
};
export const getProduct = async (sku: string): Promise<Product> => {
      const queryString =`
    {
  products(search: "", filter: { sku: { eq: "${sku}" } }) {
    items {
      id
      name
      sku
      review_count
      mode_expedition
      rating_summary
      special_price
      ... on ConfigurableProduct {
        configurable_options {
          id
          label
          attribute_code
          attribute_id
          values {
            label
            value_index
          }
        }
        variants {
          product {
            id
            name
            sku
            couleur
            motif
            size
            media_gallery {
              url
              label
            }
            price_range {
              maximum_price {
                regular_price {
                  currency
                  value
                }
                final_price {
                  currency
                  value
                }
              }
            }
            
          }
        }
      }
      media_gallery {
        url
      }
      price_range {
        maximum_price {
          regular_price {
            currency
            value
          }
          final_price {
            currency
            value
          }
        }
      }
    }
  }
}
`;
    const query=gql`${queryString}`;
try {
  const client = getApolloClient();
    const response = await client.query({
        query,    
        
      });

      const product = response.data.products.items[0] as Product;
      return product;
} catch (error) {
    console.error('Error fetching product:', error);
    throw error;    
}
};

export const getProductRest = async (sku: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/rest/default/V1/products/${sku}`, {headers: {
      Authorization : `Bearer ${MAGE_TOKEN}`
    }});
    const product = response.data;
    return product;
  } catch (error) {
    console.error('Error fetching product rest:', error.response.data);
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
    throw error;
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
    throw error;
  }
}
export const getAttributeValues = async (attributeCode: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/rest/V1/products/attributes/${attributeCode}/options`, {headers: {
      Authorization
      : `Bearer ${MAGE_TOKEN}`
    }});
    const attributeValues = response.data;
    if(!["mode_expedition","brand"].includes(attributeCode))return attributeValues
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


