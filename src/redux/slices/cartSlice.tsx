import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    getCart as fetchCartApi,
    addToCart as addToCartApi,
    updateCart as updateCartApi,
    deleteCart as deleteCartApi,
    CartResponse as ApiCartResponse, CartItem as ApiCartItem,
    CartItem
} from '@/api/cartApi';
import { createOrder as createOrderApi } from '@/api/orderApi';
import { consoleLog } from '@/utils/helpers';
import i18n from '@/utils/i18n';
import { RootState } from '../store';

interface ClientCartItem extends ApiCartItem {
    loading?: boolean;
    previousQty?: number;
}

// Client-side cart response definition
interface CartResponseClient extends ApiCartResponse {
    items: ClientCartItem[];
}

// 1. REFACTORED AND SIMPLIFIED STATE SHAPE
// We remove the redundant `cart` array. `details` is now the single source of truth.
interface CartState {
    details: CartResponseClient | null;
    backupDetails?: CartResponseClient | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: CartState = {
    details: null,
    backupDetails: undefined,

    status: 'idle', // 'idle' is a clearer initial state
    error: null,
};

// 2. HELPER FUNCTION TO PREVENT CODE DUPLICATION
// This centralizes cart total calculations.
const recalculateCartTotals = (state: CartState) => {
    if (state.details) {
        state.details.items_qty = state.details.items.reduce((total, item) => total + item.qty, 0);
        // You could add other grand total calculations here as well
    }
};
export const createOrder = createAsyncThunk(
    'cart/createOrder',
    async (payload, thunkAPI) => {
        try {
            const response = await createOrderApi(payload);
            return response;
        }
        catch (error: any) { // Ensure error is typed as 'any' for message access
            return thunkAPI.rejectWithValue(__DEV__ ? error.message : i18n.t('error_creating_order'));
        }
    });

// Fetch Cart Items Thunk
export const fetchCartItems = createAsyncThunk(
    'cart/fetchCartItems',
    async (_, thunkAPI) => {
        try {
            const response = await fetchCartApi();
            return response;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(__DEV__ ? error.message : i18n.t('error_fetching_cart'));
        }
    }
);

// Add Item to Cart Thunk
export const addItemToCart = createAsyncThunk(
    'cart/addItemToCart',
    async (item: any, thunkAPI) => {
        try {
            const startTime = Date.now();
            const response = await addToCartApi(item); // Added await here
            const endTime = Date.now();
            const elapsedTime = endTime - startTime;
            consoleLog(`Elapsed time [api]: ${elapsedTime} ms`);
            return response;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(__DEV__ ? error.message : i18n.t('error_adding_item_to_cart'));
        }
    }
);

// Update Item in Cart Thunk
export const updateItemInCart = createAsyncThunk(
    'cart/updateItemInCart',
    async (item: object, thunkAPI) => {
        try {
            
            const response = await updateCartApi(item);
            return response;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(__DEV__ ? error.message : i18n.t('error_updating_item_in_cart'));
        }
    }
);

interface RemoveItemPayload {
    itemId: number;
    token: string | null; // The auth token from the component
}

// Remove Item from Cart Thunk
export const removeItemFromCart = createAsyncThunk(
    'cart/removeItemFromCart',
    // The thunk now expects our payload object
    async (payload: RemoveItemPayload, thunkAPI) => {
        try {
            // Pass the entire payload to the API function
            deleteCartApi(payload);
            // On success, return the itemId to the reducer so it knows which item to remove from the state.
            return payload.itemId;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(__DEV__ ? error.message : i18n.t('error_removing_item_from_cart'));
        }
    }
);
interface ClearCartPayload {
    callApi: Boolean
    token?: string
}
export const clearCart = createAsyncThunk<
    void,
    ClearCartPayload,
    { state: RootState }
>(
    'cart/clearCart',
    async ({ callApi = false, token }: ClearCartPayload, thunkAPI) => {
        // --- THIS IS THE KEY CHANGE ---
        // Get the items to delete from the state as it exists RIGHT NOW,
        // before the .pending reducer's optimistic update has visually cleared them.
        const stateBeforeUpdate = thunkAPI.getState();
        const itemsToDelete = stateBeforeUpdate.cart.backupDetails?.items;

        try {
            // Only proceed with API calls if requested
            if (callApi) {
                // Guard clause: ensure we have a token and items to delete
                // Use the list we captured at the beginning.
                if (itemsToDelete && itemsToDelete.length > 0) {
                    consoleLog(`Clearing ${itemsToDelete.length} item(s) from cart via API...`);

                    // Create an array of promises from the captured list
                    const deletePromises = itemsToDelete.map(item =>
                        deleteCartApi({
                            itemId: item.item_id,
                            token: token,
                        })
                    );

                    // Wait for all the delete requests to complete
                    await Promise.all(deletePromises);
                    consoleLog("All items cleared from API successfully.");
                } else {
                    consoleLog("No items to clear from API or no token provided.");
                }
            }

            // The thunk has succeeded. The reducer will handle the final state.

        } catch (error: any) {
            console.error("Error clearing cart via API:", error);
            // On failure, the .rejected reducer will use the backup to restore the state.
            return thunkAPI.rejectWithValue(__DEV__ ? error.message : i18n.t('error_clearing_cart'));
        }
    }
);
// 3. REFACTORED SLICE WITH SIMPLIFIED REDUCERS
const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        clearCartError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // --- Fetch Cart ---
            .addCase(fetchCartItems.pending, (state) => {
                // Only show a global loading indicator on the initial fetch
                if (state.status === 'idle') {
                    state.status = 'loading';
                }
                state.error = null;
            })
            .addCase(fetchCartItems.fulfilled, (state, action: PayloadAction<CartResponseClient | null>) => {
                state.status = 'succeeded';
                if (action.payload) {
                    // Ensure all items from API have our client-side `loading` property
                    const itemsWithLoading = action.payload.items.map(item => ({ ...item, loading: false }));
                    state.details = { ...action.payload, items: itemsWithLoading };
                } else {
                    state.details = null; // Handle cases where API returns an empty/null cart
                }
            })
            .addCase(fetchCartItems.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            // --- Add Item ---
            .addCase(addItemToCart.pending, (state, action) => {
                if (!state.details) return; // Cannot optimistically update if cart structure doesn't exist

                const existingItem = state.details.items.find((item) => item.sku === action.meta.arg.sku);
                if (existingItem) {
                    existingItem.loading = true;
                } else {
                    // Optimistically add a placeholder for instant UI feedback
                    state.details.items.push({
                        ...action.meta.arg,
                        item_id: 'temp-' + Date.now(), // A temporary ID is crucial
                        loading: true,
                    });
                }
            })
            .addCase(addItemToCart.fulfilled, (state, action: PayloadAction<ClientCartItem>) => {
                if (!state.details) return;

                const newItem = { ...action.payload, loading: false };
                // Find the placeholder (or existing item) by its SKU and replace it with the real data from the API
                const itemIndex = state.details.items.findIndex(item => item.sku === newItem.sku);

                if (itemIndex !== -1) {
                    state.details.items[itemIndex] = newItem;
                } else {
                    state.details.items.push(newItem); // Fallback if item wasn't found
                }
                recalculateCartTotals(state);
                state.error = null;
            })
            .addCase(addItemToCart.rejected, (state, action) => {
                state.error = action.payload as string;
                if (!state.details) return;

                // Rollback the optimistic update on failure
                const itemIndex = state.details.items.findIndex(item => item.sku === action.meta.arg.sku);
                if (itemIndex !== -1) {
                    if (state.details.items[itemIndex].item_id.toString().startsWith('temp-')) {
                        state.details.items.splice(itemIndex, 1); // Remove the temporary placeholder
                    } else {
                        state.details.items[itemIndex].loading = false; // Just reset loading on an existing item
                    }
                }
            })

            // --- Remove Item ---
            .addCase(removeItemFromCart.pending, (state, action) => {
                console.log("pending remove")
                if (!state.details) return;

                // The itemId is now inside `action.meta.arg`
                const itemId = action.meta.arg.itemId;
                const item = state.details.items.find((i) => i.item_id === itemId);
                if (item) {
                    item.loading = true;
                }
            })
            .addCase(removeItemFromCart.fulfilled, (state, action: PayloadAction<number>) => {
                // The payload is the itemId we returned from the thunk
                if (!state.details) return;
                state.details.items = state.details.items.filter(
                    (item) => item.item_id !== action.payload
                );
                recalculateCartTotals(state);
                console.log("fullfilled remove")
            })
            .addCase(removeItemFromCart.rejected, (state, action) => {
                state.error = action.payload as string;
                if (!state.details) return;
                // The itemId is inside `action.meta.arg`
                const itemId = action.meta.arg.itemId;
                const item = state.details.items.find((i) => i.item_id === itemId);
                if (item) {
                    item.loading = false;
                }
            })

            .addCase(updateItemInCart.pending, (state, action) => {
                if (!state.details) return;

                // Get the item_id and the new (optimistic) quantity from the action
                const { item_id, qty: newQty } = action.meta.arg.cartItem;
                const item = state.details.items.find((i) => i.item_id === item_id);

                if (item) {
                    // Store the original quantity for potential rollback
                    item.previousQty = item.qty;
                    
                    // Optimistically update the UI with the new quantity
                    item.qty = newQty;
                    item.loading = true;

                    // Immediately recalculate totals for instant UI feedback
                    recalculateCartTotals(state);
                }
            })
            .addCase(updateItemInCart.fulfilled, (state, action: PayloadAction<ClientCartItem>) => {
                state.status = 'succeeded';
                if (!state.details) return;

                const updatedItemFromServer = action.payload;
                const itemIndex = state.details.items.findIndex((i) => i.item_id === updatedItemFromServer.item_id);

                if (itemIndex !== -1) {
                    const image = state.details.items[itemIndex].image
                    // The update was successful. Replace the item with the final version from the server.
                    // This also cleans up the `previousQty` property automatically.
                    state.details.items[itemIndex] = { ...updatedItemFromServer, loading: false, image };
                }
                
                // Recalculate totals with the final server data to ensure consistency.
                recalculateCartTotals(state);
                state.error = null;
            })
            .addCase(updateItemInCart.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
                if (!state.details) return;

                const { item_id } = action.meta.arg.cartItem;
                const item = state.details.items.find((i) => i.item_id === item_id);

                if (item) {
                    // The update failed. Roll back to the original quantity if it was stored.
                    if (item.previousQty !== undefined) {
                        item.qty = item.previousQty;
                    }
                    // Clean up the temporary property and reset loading state.
                    delete item.previousQty;
                    item.loading = false;

                    // Recalculate totals to reflect the rollback.
                    recalculateCartTotals(state);
                }
            })


            .addCase(createOrder.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.details = null;
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(clearCart.pending, (state, action) => {
                // We only perform an optimistic update if the API is being called.
                // If callApi is false, we can just wait for fulfilled.
                if (action.meta.arg.callApi) {
                    consoleLog("Optimistically clearing cart...");

                    // 1. Backup the current state in case we need to roll back.
                    
                    // 2. Apply the optimistic update immediately.
                    if (state.details) {
                        state.backupDetails = JSON.parse(JSON.stringify(state.details));
                        state.details.items = [];
                        recalculateCartTotals(state); // Update totals to reflect the empty cart
                    }
                }
                state.status = 'loading';
                state.error = null; // Clear previous errors
            })
            .addCase(clearCart.fulfilled, (state) => {
                state.status = 'succeeded';
                consoleLog("succeeded to clear cart");

                // If the action was just to clear local state (not an optimistic update), do it here.
                if (state.backupDetails === undefined && state.details) {
                    state.details.items = [];
                    recalculateCartTotals(state);
                }

                // 3. The optimistic update was successful, so we can discard the backup.
                state.backupDetails = undefined;
            })
            .addCase(clearCart.rejected, (state, action) => {
                state.status = 'failed';
                console.error("Error clearing cart, rolling back UI.", action);
                state.error = action.payload as string;

                // 4. The API call failed. Restore the cart from the backup.
                state.details = state.backupDetails;

                // 5. Clean up the backup state.
                state.backupDetails = undefined;
            });

    },

});


export const { clearCartError } = cartSlice.actions;

export default cartSlice.reducer;
