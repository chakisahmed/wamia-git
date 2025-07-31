import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    CategoriesResponse,
    fetchCategories3 as fetchCategoriesApi,
} from '@/api/categoriesApi';

export interface CategoriesState {
    categories: CategoriesResponse | null;
    status: 'loading' | 'succeeded' | 'failed' | null;
    error: string | null | any; // You can be more specific if you know the error type
}
const initialState: CategoriesState = {
    categories: null,
    status: null,
    error: null,
};
// Fetch Categories Thunk
export const fetchCategories = createAsyncThunk(
    'categories/fetchCategories',
    async (_, thunkAPI) => {
        try {
            const response = await fetchCategoriesApi("2");   
            return response;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }  
);

// Create the Categories Slice
const categoriesSlice = createSlice({
    name: 'categories',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCategories.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.categories = action.payload;
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export default categoriesSlice.reducer;