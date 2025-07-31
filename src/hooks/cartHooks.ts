// import { useEffect, useState, useCallback } from 'react';
// import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
// import { useSelector, useDispatch } from 'react-redux';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { RootState } from '../redux/store';

// import { consoleLog } from '../utils/helpers';
// import { AuthState, setUserToken } from '../redux/slices/authSlice'; // For clearing token on logout
// import { GET_CART_QUERY,
//   GET_CUSTOMER_CART_QUERY,
//   CREATE_GUEST_CART_MUTATION,
//   ADD_TO_CART_MUTATION,
//   UPDATE_CART_ITEM_MUTATION,
//   REMOVE_FROM_CART_MUTATION,
//   MERGE_CARTS_MUTATION } from '@/graphql/queries';



// const GUEST_CART_ID_KEY = 'guestCartId';

// export const useCart = () => {
//   const dispatch = useDispatch();
//   const userToken  = useSelector((state: AuthState) => state.userToken);
//   const [cartId, setCartId] = useState<string | null>(null);

//   // --- CART ID MANAGEMENT ---
//   // Effect to load cart ID from storage or determine based on login state
//   useEffect(() => {
//     const initializeCart = async () => {
//       if (userToken) {
//         // User is logged in, we don't need a guest cart ID
//         setCartId(null); // Will be handled by GET_CUSTOMER_CART_QUERY
//         await AsyncStorage.removeItem(GUEST_CART_ID_KEY);
//       } else {
//         // User is a guest, try to load existing guest cart ID
//         const storedGuestCartId = await AsyncStorage.getItem(GUEST_CART_ID_KEY);
//         setCartId(storedGuestCartId);
//       }
//     };
//     initializeCart();
//   }, [userToken]);

//   // --- GRAPHQL OPERATIONS ---

//   // For creating a new guest cart
//   const [createGuestCart, { loading: creatingGuestCart }] = useMutation(CREATE_GUEST_CART_MUTATION, {
//     onCompleted: (data) => {
//       const newGuestCartId = data.createEmptyCart;
//       if (newGuestCartId) {
//         AsyncStorage.setItem(GUEST_CART_ID_KEY, newGuestCartId);
//         setCartId(newGuestCartId);
//       }
//     },
//     // Refetch the query to update the UI
//     refetchQueries: [{ query: GET_CART_QUERY, variables: { cartId } }],
//   });

//   // Fetching logic: one query for guests, another for customers
//   const guestCartResult = useQuery(GET_CART_QUERY, {
//     variables: { cartId: cartId! },
//     skip: !cartId || !!userToken, // Skip if no guest cartId or if user is logged in
//   });

//   const customerCartResult = useQuery(GET_CUSTOMER_CART_QUERY, {
//     skip: !userToken, // Skip if user is not logged in
//   });

//   // Determine which result to use
//   const { data, loading: cartLoading, error: cartError } = userToken ? customerCartResult : guestCartResult;
//   const activeCart = userToken ? data?.customerCart : data?.cart;

//   // --- MUTATIONS with AUTOMATIC CACHE UPDATES ---

//   const [addToCartMutation, { loading: addingItem }] = useMutation(ADD_TO_CART_MUTATION);
//   const [updateItemMutation, { loading: updatingItem }] = useMutation(UPDATE_CART_ITEM_MUTATION);
//   const [removeItemMutation, { loading: removingItem }] = useMutation(REMOVE_FROM_CART_MUTATION);
//   const [mergeCartsMutation] = useMutation(MERGE_CARTS_MUTATION);

//   // --- HELPER & EXPORTED FUNCTIONS ---

//   const ensureGuestCartExists = useCallback(async () => {
//     if (userToken) return null; // Not for logged-in users
//     let currentGuestCartId = await AsyncStorage.getItem(GUEST_CART_ID_KEY);
//     if (!currentGuestCartId) {
//       consoleLog('No guest cart found, creating a new one.');
//       const result = await createGuestCart();
//       currentGuestCartId = result.data.createEmptyCart;
//     }
//     return currentGuestCartId;
//   }, [userToken, createGuestCart]);

//   const addItem = async (sku: string, quantity: number) => {
//     const cartIdForMutation = userToken ? activeCart?.id : await ensureGuestCartExists();
//     if (!cartIdForMutation) {
//       console.error('Could not determine cart ID for adding item.');
//       return;
//     }
//     return addToCartMutation({
//       variables: {
//         cartId: cartIdForMutation,
//         cartItems: [{ sku, quantity }],
//       },
//       // Optimistic response for a snappier UI
//       optimisticResponse: {
//         addProductsToCart: {
//           __typename: 'AddProductsToCartOutput',
//           cart: {
//             ...activeCart,
//             __typename: 'Cart',
//             items: [
//               ...activeCart.items,
//               {
//                 __typename: 'SimpleCartItem',
//                 id: `temp-${Math.random()}`,
//                 uid: `temp-uid-${Math.random()}`,
//                 quantity,
//                 product: {
//                     __typename: 'SimpleProduct',
//                     sku,
//                     name: 'Adding...',
//                     image: { __typename: 'ProductImage', url: '', label: ''},
//                     price_range: { __typename: 'PriceRange', minimum_price: { __typename: 'ProductPrice', final_price: { __typename: 'Money', value: 0, currency: 'USD' } } }
//                 }
//               },
//             ],
//             total_quantity: activeCart.total_quantity + quantity,
//           },
//           user_errors: [],
//         }
//       },
//     });
//   };

//   const removeItem = (itemUid: string) => {
//     if (!activeCart?.id) return;
//     return removeItemMutation({
//       variables: {
//         cartId: activeCart.id,
//         cartItemUid: itemUid,
//       },
//     });
//   };

//   const updateItemQuantity = (itemUid: string, quantity: number) => {
//     if (!activeCart?.id) return;
//     if (quantity <= 0) {
//       // Magento treats quantity 0 as removal, so we call the correct mutation
//       return removeItem(itemUid);
//     }
//     return updateItemMutation({
//       variables: {
//         cartId: activeCart.id,
//         cartItemUid: itemUid,
//         quantity,
//       },
//     });
//   };

//   const mergeGuestCartToCustomer = useCallback(async (destinationCartId: string) => {
//     const sourceCartId = await AsyncStorage.getItem(GUEST_CART_ID_KEY);
//     if (sourceCartId && destinationCartId) {
//       consoleLog(`Merging guest cart ${sourceCartId} into customer cart ${destinationCartId}`);
//       await mergeCartsMutation({
//         variables: { sourceCartId, destinationCartId },
//         refetchQueries: [GET_CUSTOMER_CART_QUERY] // Refetch customer cart after merge
//       });
//       await AsyncStorage.removeItem(GUEST_CART_ID_KEY);
//       setCartId(null);
//     }
//   }, [mergeCartsMutation]);

//   // Handle auto-merge on login
//   useEffect(() => {
//     if (userToken && customerCartResult.data?.customerCart?.id) {
//       mergeGuestCartToCustomer(customerCartResult.data.customerCart.id);
//     }
//   }, [userToken, customerCartResult.data, mergeGuestCartToCustomer]);

//   return {
//     cart: activeCart,
//     items: activeCart?.items ?? [],
//     totalQuantity: activeCart?.total_quantity ?? 0,
//     grandTotal: activeCart?.prices?.grand_total,
//     loading: cartLoading || creatingGuestCart || addingItem || updatingItem || removingItem,
//     error: cartError,
//     addItem,
//     removeItem,
//     updateItemQuantity,
//   };
// };