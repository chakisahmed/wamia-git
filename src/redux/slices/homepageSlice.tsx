import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAttributeValues, CustomAttribute } from '@/api/productsApi';
import { consoleLog } from '@/utils/helpers';


interface HomepageState {

    modeExpedition: CustomAttribute;
    brand: CustomAttribute;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: HomepageState = {
    modeExpedition: {},
    brand: {},
    status: 'idle',
    error: null,
};

export const fetchHomepageData = createAsyncThunk(
    'homepage/fetchHomepageData',
    async (_, thunkAPI) => {
        try {


            const modeExpedition = await getAttributeValues('mode_expedition')
            const brand = await getAttributeValues('brand')
            //consoleLog(JSON.stringify(brand))
            return {
                modeExpedition,
                brand

            };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

const homepageSlice = createSlice({
    name: 'homepage',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchHomepageData.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchHomepageData.fulfilled, (state, action) => {
                state.status = 'succeeded';

                state.modeExpedition = action.payload.modeExpedition
                state.brand = action.payload.brand

            })
            .addCase(fetchHomepageData.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });
    },
});

export default homepageSlice.reducer;