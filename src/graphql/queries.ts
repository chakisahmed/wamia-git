import { gql } from '@apollo/client';

export const GET_PRODUCTS = gql`
  query GetProducts(
    $search: String
    $filter: ProductAttributeFilterInput
    $currentPage: Int
    $pageSize: Int
    $sort: ProductAttributeSortInput
  ) {
    products(
      search: $search
      filter: $filter
      currentPage: $currentPage
      pageSize: $pageSize
      sort: $sort
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

export const GET_PRODUCT_QUERY = gql`
  query GetProductBySku($sku: String!) {
    products(filter: { sku: { eq: $sku } }) {
      items {
        id
        name
        sku
        review_count
        mode_expedition
        rating_summary
        special_price
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
      }
    }
  }
`;


const WISHLIST_ITEM_FRAGMENT = gql`
  fragment WishlistItemFields on Wishlist {
    id
    items_count
    items_v2(currentPage: 1, pageSize: 20) {
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
`;
export const GET_WISHLIST = gql`
  query GetCustomerWishlist {
    customer {
      wishlists {
        ...WishlistItemFields
      }
    }
  }
  ${WISHLIST_ITEM_FRAGMENT}
`;
export const ADD_PRODUCT_TO_WISHLIST = gql`
  mutation AddProductsToWishlist($wishlistId: ID!, $wishlistItems: [WishlistItemInput!]!) {
    addProductsToWishlist(
      wishlistId: $wishlistId
      wishlistItems: $wishlistItems
    ) {
      user_errors {
        code
        message
      }
      wishlist {
        ...WishlistItemFields
      }
    }
  }
  ${WISHLIST_ITEM_FRAGMENT}
`;

// Mutation for removing an item
export const REMOVE_PRODUCT_FROM_WISHLIST = gql`
  mutation RemoveProductsFromWishlist($wishlistId: ID!, $wishlistItemsIds: [ID!]!) {
    removeProductsFromWishlist(
      wishlistId: $wishlistId
      wishlistItemsIds: $wishlistItemsIds
    ) {
      user_errors {
        code
        message
      }
      wishlist {
        ...WishlistItemFields
      }
    }
  }
  ${WISHLIST_ITEM_FRAGMENT}
`;


 /**************************/// Below is discontinued due to magento version////******************* */ */



// This fragment defines the shape of the cart data we want back from every mutation/query.
// This is the key to automatic cache updates.

// export const CART_FRAGMENT = gql`
//   fragment CartFields on Cart {
//     id
//     total_quantity
//     email
//     is_virtual
//     applied_coupons {
//       code
//     }
//     items {
//       uid # Use UID for removal
//       id # This is the cart_item_id
//       quantity
//       prices {
//         fixed_product_taxes {
//           amount {
//             value
//             currency
//             __typename
//           }
//           label
//           __typename
//         }
//         __typename
//       }

//       product {
//         sku
//         name
//         image {
//           url
//           label
//         }
//         price_tiers {
//           quantity
//           final_price {
//             value
//           }
//           discount {
//             amount_off
//             percent_off
//           }
//         }

        
//       }
//       ... on ConfigurableCartItem {
//         configurable_options {
//           option_label
//           value_label
//         }
//       }
//     }
//     prices {
//       grand_total { value currency }
//       subtotal_including_tax { value currency }
//       discounts { label amount { value currency } }
//     }
//     shipping_addresses {
//       firstname
//       lastname
//       street
//       city
//       region { label }
//       postcode
//       country { label }
//       telephone
//       selected_shipping_method {
//         carrier_code
//         method_code
//         carrier_title
//         method_title
//         amount { value currency }
//       }
//     }
//     billing_address {
//       firstname
//       lastname
//       street
//       city
//       region { label }
//       postcode
//       country { label }
//       telephone
//     }
//     available_payment_methods {
//       code
//       title
//     }
//     selected_payment_method {
//       code
//       title
//     }
//   }
// `;

// // 1. Query to get the cart (for both guest and customer)
// export const GET_CART_QUERY = gql`
//   query GetCart($cartId: String!) {
//     cart(cart_id: $cartId) {
//       ...CartFields
//     }
//   }
//   ${CART_FRAGMENT}
// `;

// // Query to get the active cart for a logged-in customer
// export const GET_CUSTOMER_CART_QUERY = gql`
//   query GetCustomerCart {
//     customerCart {
//       ...CartFields
//     }
//   }
//   ${CART_FRAGMENT}
// `;

// // 2. Mutation to create an empty guest cart
// export const CREATE_GUEST_CART_MUTATION = gql`
//   mutation CreateGuestCart {
//     createEmptyCart
//   }
// `;

// // 3. Mutation to add items to the cart
// export const ADD_TO_CART_MUTATION = gql`
//   mutation AddToCart($cartId: String!, $cartItems: [CartItemInput!]!) {
//     addProductsToCart(
//       cartId: $cartId
//       cartItems: $cartItems
//     ) {
//       cart {
//         ...CartFields
//       }
//       user_errors {
//         code
//         message
//       }
//     }
//   }
//   ${CART_FRAGMENT}
// `;

// // 4. Mutation to update item quantity
// export const UPDATE_CART_ITEM_MUTATION = gql`
//   mutation UpdateCartItems($cartId: String!, $cartItemUid: ID!, $quantity: Float!) {
//     updateCartItems(
//       input: {
//         cart_id: $cartId
//         cart_items: [
//           {
//             cart_item_uid: $cartItemUid
//             quantity: $quantity
//           }
//         ]
//       }
//     ) {
//       cart {
//         ...CartFields
//       }
//     }
//   }
// `;

// // 5. Mutation to remove an item
// export const REMOVE_FROM_CART_MUTATION = gql`
//   mutation RemoveFromCart($cartId: String!, $cartItemUid: ID!) {
//     removeItemFromCart(
//       input: {
//         cart_id: $cartId
//         cart_item_uid: $cartItemUid
//       }
//     ) {
//       cart {
//         ...CartFields
//       }
//     }
//   }
// `;

// // 6. Mutation to merge guest cart to customer cart after login
// export const MERGE_CARTS_MUTATION = gql`
//   mutation MergeCarts($sourceCartId: String!, $destinationCartId: String!) {
//     mergeCarts(
//       source_cart_id: $sourceCartId,
//       destination_cart_id: $destinationCartId
//     ) {
//       ...CartFields
//     }
//   }
//   ${CART_FRAGMENT}
// `;