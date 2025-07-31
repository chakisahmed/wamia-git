import { useLazyQuery, useMutation, ApolloError, useApolloClient } from "@apollo/client";
import { ADD_PRODUCT_TO_WISHLIST, GET_WISHLIST, REMOVE_PRODUCT_FROM_WISHLIST } from "../graphql/queries";
import { useSelector } from "react-redux";
import { useEffect, useMemo, useState } from "react";
import { RootState } from "@/redux/store";

// --- Interfaces (no changes) ---
interface Price {
    currency: string;
    value: number;
}
interface PriceRange {
    minimum_price: { regular_price: Price; final_price: Price; };
    maximum_price: { regular_price: Price; final_price: Price; };
}
interface Product {
    uid: string;
    name: string;
    sku: string;
    price_range: PriceRange;
    media_gallery: { url: string; label: string; }[];
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


// This is our custom hook. All logic is now inside this function.
export const useWishlist = () => {
  const userToken = useSelector((state: RootState) => state.auth.userToken);

  // --- Query ---
  // Added `refetch` to the destructured result and `notifyOnNetworkStatusChange` for better loading state on refetch
  const [getWishlist, { loading: wishlistLoading, error: wishlistError, data: wishlistData, refetch }] = useLazyQuery(GET_WISHLIST, {
      fetchPolicy: 'cache-and-network',
      skip: !userToken,
      notifyOnNetworkStatusChange: true, // Ensures loading state is true during refetches
  });

    const client = useApolloClient();

 // 3. Modify the useEffect to handle logout
  useEffect(() => {
    if (userToken) {
        // User is logged in, fetch their wishlist
        setExecutionError(null);
        getWishlist().catch(err => {
            setExecutionError(err);
        });
    } else {
        // User has logged out. Clear the wishlist data from the Apollo cache.
        // This prevents the previous user's data from being displayed.
        client.writeQuery({
            query: GET_WISHLIST,
            data: {
                // Set the top-level field of the query result to null.
                // Based on your data structure, this appears to be 'customer'.
                customer: null
            }
        });
    }
    // 4. Add `client` to the dependency array
  }, [userToken, getWishlist, client]);

    const [executionError, setExecutionError] = useState<ApolloError | null>(null);

  // --- Mutations ---
  // Replaced manual cache `update` with `refetchQueries` for more robust and reliable data synchronization.
  const [addProductMutation, { loading: addingProduct, error: addError }] = useMutation(ADD_PRODUCT_TO_WISHLIST, {
    refetchQueries: [GET_WISHLIST],
    awaitRefetchQueries: true, // Ensures the `addingProduct` loading state persists until the refetch is complete
    onError: (error) => {
        setExecutionError(error);
      }
  });

  const [removeProductMutation, { loading: removingProduct, error: removeError }] = useMutation(REMOVE_PRODUCT_FROM_WISHLIST, {
    refetchQueries: [GET_WISHLIST],
    awaitRefetchQueries: true, // Ensures `removingProduct` loading state persists until refetch is complete
  });

   // --- Wrapper functions ---
  const addProduct = (sku: string) => {
    setExecutionError(null); // Clear previous errors
    return addProductMutation({ variables: { wishlistId: "0", wishlistItems: [{ sku, quantity: 1 }] } }).catch(e => {
        console.error("Failed to add product to wishlist:", e);
    });
  };

  const removeProduct = (wishlistItemId: string) => {
    setExecutionError(null); // Clear previous errors
    return removeProductMutation({ variables: { wishlistId: "0", wishlistItemsIds: [wishlistItemId] } }).catch(e => {
        console.error("Failed to remove product from wishlist:", e);
    });
  };

  // --- Processed Data and States ---
  const items: WishlistItem[] = wishlistData?.customer?.wishlists[0]?.items_v2?.items ?? [];
  
  const wishlistSkus = useMemo(() => {
    return new Set(items.map(item => item.product.sku));
  }, [items]);

  const loading = wishlistLoading || addingProduct || removingProduct;
  
  // --- Enhanced Error Handling ---
  const combinedError = executionError || wishlistError || addError || removeError;

  // Parses the ApolloError object to get a user-friendly message.
  const getErrorMessage = (error: ApolloError | undefined): string | null => {
    if (!error) return null;
    if (error.graphQLErrors && error.graphQLErrors.length > 0) {
      return error.graphQLErrors[0].message;
    }
    // This will now be correctly triggered by our executionError state
    if (error.networkError) {
      return "Network error. Please check your connection and try again.";
    }
    return error.message || "An unknown error occurred.";
  };

  const errorMessage = getErrorMessage(combinedError);

  // --- Refetch Logic ---
  const refetchWishlist = () => {
    if (userToken && refetch) {
      // MODIFIED: Clear previous errors and add .catch() here as well for the retry button.
      setExecutionError(null);
      refetch().catch(err => {
        setExecutionError(err);
      });
    }
  };



  return {
    items,
    wishlistSkus,
    loading,
    error: combinedError,
    errorMessage,
    addProduct,
    removeProduct,
    refetchWishlist,
  };
};