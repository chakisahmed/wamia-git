import { createSlice } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { addProductsToWishlist, removeProductsFromWishlist, getWishlist, WishlistItem } from '@/api/wishlistApi';

export const fetchWishlist = createAsyncThunk(
    'wishList/fetchWishlist',
    async (_, { rejectWithValue }) => {
        try {   
            const response = await getWishlist();    
            return response.data.customer.wishlists[0].items_v2.items;
        } catch (error) {
            console.error("Error in fetchWishlist", error); // Add this
            //await client.clearStore();    
            return rejectWithValue(error.message);
        }
    }
);   

export const addProductToWishlist = createAsyncThunk( 
    'wishList/addProductToWishlist',
    async (sku: string, { rejectWithValue }) => {
        try {
            const response = await addProductsToWishlist(sku);
            return response.wishlist.items_v2.items;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const removeProductFromWishlist = createAsyncThunk(
    'wishList/removeProductFromWishlist',
    async (wishlistItemId: number, { rejectWithValue }) => {
        try {
            const response = await removeProductsFromWishlist(wishlistItemId);
            return response.wishlist.items_v2.items;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
export const clearWishlist = createAsyncThunk(
    'wishList/clearWishlist',
    async (_, { rejectWithValue }) => {
        try {
            return [];
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
export const wishListSlice = createSlice({
    name: "wishList",
    initialState: {
        wishList: [] as WishlistItem[], 
        status: 'idle' as 'idle' | 'loading' | 'succeeded' | 'failed' | null,
        error: null ,
    },
    reducers:{
    },
    extraReducers: (builder) => {
        builder.addCase(fetchWishlist.pending, (state) => {
            state.status = 'loading';
        });
        builder.addCase(fetchWishlist.rejected, (state, action) => {
            state.status = 'failed';
            state.error = action.payload;
            state.wishList = [];
        });
        builder.addCase(fetchWishlist.fulfilled, (state, action) => {
            state.status = 'succeeded';
            state.wishList = action.payload;
        });
    
        builder.addCase(addProductToWishlist.pending, (state) => {
            state.status = 'loading';
        });
        builder.addCase(addProductToWishlist.rejected, (state, action) => {
            state.status = 'failed';
            state.error = action.payload;
        });
        builder.addCase(addProductToWishlist.fulfilled, (state, action) => {
            state.status = 'succeeded';
            state.wishList = action.payload;
        });
    
        builder.addCase(removeProductFromWishlist.fulfilled, (state, action) => {
            state.wishList = action.payload;
        });
        builder.addCase(removeProductFromWishlist.pending, (state) => {
            state.status = 'loading';
        });
        builder.addCase(removeProductFromWishlist.rejected, (state, action) => {
            state.status = 'failed';
            state.error = action.payload;
        });
        builder.addCase(clearWishlist.fulfilled, (state, action) => {
            state.wishList = action.payload;
        });
        builder.addCase(clearWishlist.pending, (state) => {
            state.status = 'loading';
        });
        builder.addCase(clearWishlist.rejected, (state, action) => {
            state.status = 'failed';
            state.error = action.payload;
        });
    }
        
});



export default wishListSlice.reducer;