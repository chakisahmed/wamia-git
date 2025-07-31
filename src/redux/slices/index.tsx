import { combineReducers } from 'redux';
import drawerReducer from '@/redux/slices/drawerSlice';
import cartReducer from '@/redux/slices/cartSlice';
import wishListReducer from '@/redux/slices/wishListSlice';
import authReducer from '@/redux/slices/authSlice';
import categoryReducer from '@/redux/slices/categorySlice';
import homepageReducer from '@/redux/slices/homepageSlice';
  
const rootReducer = combineReducers({
    drawer: drawerReducer,
    cart: cartReducer,
    categories:categoryReducer,
    wishList : wishListReducer,
    homepage: homepageReducer,
    auth: authReducer
});

export default rootReducer;