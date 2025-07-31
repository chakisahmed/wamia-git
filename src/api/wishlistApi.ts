import {  gql } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApolloClient } from './apolloClient';
import * as Keychain from 'react-native-keychain';

interface Price {
    currency: string;
    value: number;
}

interface PriceRange {
    minimum_price: {
        regular_price: Price;
        final_price: Price;
    };
    maximum_price: {
        regular_price: Price;
        final_price: Price;
    };
}

interface Product {
    uid: string;
    name: string;
    sku: string;
    price_range: PriceRange;
    media_gallery: {
        url: string;
        label: string;
    }[];
}

export interface WishlistItem {
    id: string;
    quantity: number;
    product: Product;
}

interface ItemsV2 {
    items: WishlistItem[];
}

interface Wishlist {
    id: string;
    items_count: number;
    items_v2: ItemsV2;
}

interface UserError {
    code: string;
    message: string;
}

interface AddProductsToWishlistResponse {
    wishlist: Wishlist;
    user_errors: UserError[];
}

interface ProductsResponse {
    addProductsToWishlist: AddProductsToWishlistResponse;
}
interface WishlistData {
    data: {
        customer: {
            wishlists: Wishlist[];
        };
    };
}
interface AddProductToWishlistVariables {
  wishlistId: number;
  sku: string;
  quantity: number;
}

interface AddProductsToWishlistResponse {
  wishlist: Wishlist;    
  user_errors: UserError[];
}
interface RemoveProductsFromWishlistResponse {
  wishlist: Wishlist;
  user_errors: UserError[];
}

export const addProductsToWishlist = async (sku: string): Promise<RemoveProductsFromWishlistResponse> => {
  const token = await Keychain.getGenericPassword();

  const mutationString = `
    mutation AddProductsToWishlist($wishlistId: ID!, $wishlistItems: [WishlistItemInput!]!) {
      addProductsToWishlist(
        wishlistId: $wishlistId
        wishlistItems: $wishlistItems
      ) {
        wishlist {
          id
          items_count
          items_v2(currentPage: 1, pageSize: 20) {
            items {
              id
              quantity
              ... on BundleWishlistItem {
                bundle_options {
                  values {
                    id
                    label
                    quantity
                  }
                }
              }
              product {
                uid
                name
                sku
                media_gallery {
                  url
                  label
                }
                price_range {
                  minimum_price {
                    regular_price {
                      currency
                      value
                    }
                    
                  }
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
        }
        user_errors {
          code
          message
        }
      }
    }
  `;

  const mutation = gql`${mutationString}`;

  try {
    const client = getApolloClient();
    const response = await client.mutate({
      mutation,
      variables: {
        wishlistId: "0", // Constant ID
        wishlistItems: [
          {
            sku: sku,
            quantity: 1,
          },
        ],
      },
      context: {
        headers: {
          Authorization: token ? `Bearer ${token.password}` : '',
        },
      },
    });

    return response.data.addProductsToWishlist as AddProductsToWishlistResponse;
  } catch (error) {
    console.error('Error adding products to wishlist:', error);
    throw error;
  }
};

export const removeProductsFromWishlist = async (wishlistItem: number): Promise<RemoveProductsFromWishlistResponse> => {
  // Get token from AsyncStorage
  const token = await Keychain.getGenericPassword();;

  // Define the GraphQL mutation
  const mutationString = `
    mutation RemoveProductsFromWishlist($wishlistId: ID!, $wishlistItemsIds: [ID!]!) {
      removeProductsFromWishlist(
        wishlistId: $wishlistId
        wishlistItemsIds: $wishlistItemsIds
      ) {
        wishlist {
          id
          items_count
          items_v2 {
            items {
              id
              quantity
              product {
                uid
                name
                sku
                media_gallery {
                  url
                  label
                }
                price_range {
                  minimum_price {
                    regular_price {
                      currency
                      value
                    }
                      
                  }
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
        }
        user_errors {
          code
          message
        }
      }
    }
  `;

  const mutation = gql`${mutationString}`;

  try {
    // Execute the mutation
    const client = getApolloClient();
    const response = await client.mutate({
      mutation,
      variables: {
        wishlistId: "0", // Constant ID
        wishlistItemsIds: [wishlistItem],
      },
      context: {
        headers: {
          Authorization: token ? `Bearer ${token.password}` : '',
        },
      },
    });

    return response.data.removeProductsFromWishlist as RemoveProductsFromWishlistResponse;
  } catch (error) {
    console.error('Error removing products from wishlist:', error);
    throw error;
  }
};

  export const getWishlist = async (): Promise<WishlistData> => {
    const token = await Keychain.getGenericPassword();;
    if(!token)throw Error('Not connected')
   
    const queryString=`
    query{
  customer {
    wishlists {
      id
      items_count
      items_v2 {
        items {
          id
          product {
            uid
            name
            sku
            media_gallery {
              url
              label
            }
            price_range {
              minimum_price {
                regular_price {
                  currency
                  value
                }
                

              }
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
    }
  }
}`;
    const query = gql`${queryString}`;

    try {
      const client = getApolloClient();
        const response = await client.query({
            query,
            context: {  
                headers: {
                    Authorization: `Bearer ${token.password}`,
                },
            },
        });
      return response as WishlistData;
  
    } catch (error) {
      console.error('Error getting wishlist:', error);
      throw error;
    }
  };