//app\api\cartApi.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from './axiosConfig';
import { CustomerDetails, getCustomerDetails } from './customerApi';
import {getProductImage} from './productsApi';
import { ToastAndroid } from 'react-native';
import * as Keychain from 'react-native-keychain';
import { consoleLog } from '../utils/helpers';
import i18n from '@/utils/i18n';
import axios from 'axios';


export interface CartItem {
    item_id: string;
    sku: string;
    qty: number;
    name: string;
    price: number;
    product_type: string;
    quote_id: string;
    image: string;
}
   
export interface Address {
    id: number;
    customer_id: number;
    region: {
        region_code: string;
        region: string;
        region_id: number;
    };
    region_id: number;
    country_id: string;
    street: string[];
    telephone: string;
    postcode: string;
    city: string;
    firstname: string;
    lastname: string;
    default_shipping?: boolean;
    default_billing?: boolean;
    custom_attributes?: {
        attribute_code: string;
        value: string;
    }[];
}

interface Customer {
    id: number;
    group_id: number;
    default_billing: string;
    default_shipping: string;
    created_at: string;
    updated_at: string;
    created_in: string;
    email: string;
    firstname: string;
    lastname: string;
    gender: number;
    store_id: number;
    website_id: number;
    addresses: Address[];
    disable_auto_group_change: number;
    extension_attributes: {
        is_subscribed: boolean;
    };
    custom_attributes: {
        attribute_code: string;
        value: string;
    }[];
}

export interface BillingAddress {
    id: number;
    region: string;
    region_id: number;
    region_code: string;
    country_id: string;
    street: string[];
    telephone: string;
    postcode: string;
    city: string;
    firstname: string;
    lastname: string;
    customer_id: number;
    email: string;
    same_as_billing: number;
    customer_address_id: number;
    save_in_address_book: number;
}

interface Currency {
    global_currency_code: string;
    base_currency_code: string;
    store_currency_code: string;
    quote_currency_code: string;
    store_to_base_rate: number;
    store_to_quote_rate: number;
    base_to_global_rate: number;
    base_to_quote_rate: number;
}

interface ShippingAssignment {
    shipping: {
        address: Address;
        method: string | null;
    };
    items: CartItem[];
}

interface ExtensionAttributes {
    shipping_assignments: ShippingAssignment[];
}

export interface CartResponse {
    id: number;
    created_at: string;
    updated_at: string;
    is_active: boolean;
    is_virtual: boolean;
    items: CartItem[];
    items_count: number;
    items_qty: number;  
    customer: Customer;
    billing_address: BillingAddress;
    orig_order_id: number;
    currency: Currency;
    customer_is_guest: boolean;
    customer_note_notify: boolean; 
    customer_tax_class_id: number;
    store_id: number;
    extension_attributes: ExtensionAttributes;
}   
  
export const getCart = async (): Promise<CartResponse | null> => {
    let token: Keychain.UserCredentials | null = null;
    

    try {
        // Attempt to get credentials from the keychain
        token = await Keychain.getGenericPassword();
    } catch (error) {
        // This is expected if the user is not logged in or on a fresh install.
        // We can safely ignore it and proceed as a guest.
        consoleLog("Could not get credentials from Keychain, assuming guest user.", error.message);
        
    }

    try {
        if (!token) {
            let guestCartId = await AsyncStorage.getItem('guestCartId');
            
            if (!guestCartId) {
                // If no guest cart exists, create one
                await createGuestCart();
                guestCartId = await AsyncStorage.getItem('guestCartId');
            }
            
            // If guestCartId is still null, something went wrong with creation
            if (!guestCartId) {
                console.error("Failed to create or retrieve guest cart ID.");
                return null;
            }

            return fetchCartWithImages(`/rest/V1/guest-carts/${guestCartId}`);

        } else {
            const response = await axiosInstance.get(`/rest/V1/carts/mine`, {
                headers: { Authorization: `Bearer ${token.password}` },
            });
            return addImages(response.data);
        }
    } catch (error) {
        // This catch block now primarily handles API errors (e.g., cart not found, network issues)
        console.error('Error fetching or processing cart:', error.response?.data || error.message);
        
        
        // Recovery logic
        try {
            if (token) {
                // The user was logged in, but the API call failed (e.g., cart expired).
                // Let's create a new cart for the logged-in user.
                await createCustomerCart(token.password);
                // You might want to retry getCart here or return the new empty cart
            } else {
                // The API call for a guest failed.
                await createGuestCart();
                // Optionally call getCustomerDetails() if that's part of your guest flow
                await getCustomerDetails(); 
            }
        } catch (recoveryError) {
            console.error('Failed to recover from cart error:', recoveryError);
        }

        throw Error(i18n.t("error_general")); // Return null after a failure
    }
};

const fetchCartWithImages = async (url: string): Promise<CartResponse> => {
    const response = await axiosInstance.get(url);
    return addImages(response.data);
};

const addImages = async (data: any): Promise<CartResponse> => {
    data.items = await Promise.all(
        data.items.map(async (item: any) => ({
            ...item,
            image: await getProductImage(item.sku),
        }))
    );
    return data;
};
//createGuestCart rest/V1/guest-carts
export const createGuestCart = async (): Promise<any> => {
    try {
        const response = await axiosInstance.post('/rest/V1/guest-carts');
        //store the guest cart id in async storage
        await AsyncStorage.setItem('guestCartId', response.data);
        return response.data;
    } catch (error) {
        console.error('Error creating guest cart:', error.response.data);
        throw error;
    }
};
export const assignGuestCartToCustomer = async (customer:CustomerDetails): Promise<boolean> => {
    try {
        const token = await Keychain.getGenericPassword();;
        if (!token) {
            throw new Error('Token is required');
        }

        const guestCartId = await AsyncStorage.getItem('guestCartId');
        if (!guestCartId) {
            throw new Error('Guest cart id is required');
        }  
        const response = await axiosInstance.put(`/rest/V1/guest-carts/${guestCartId}`, {customerId:customer.id,storeId:customer.store_id}, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token.password}`,
            },
        }); 

        return response.data;
    } catch (error) {   
        console.error("error assigning guest cart",error.response.data);
        throw error;
    }
};
export const addToCart = async (payload: object): Promise<CartItem> => {
    try {
        
        //const token = await Keychain.getGenericPassword();;
        var token = payload.token
        consoleLog(token)
        if (!token) {
            const guestCartId = await AsyncStorage.getItem('guestCartId');
            if (!guestCartId) {
                await createGuestCart();
            }
            payload = { ...payload, guestCartId };
            
            try{
            const response = await axiosInstance.post(`/rest/V1/guest-carts/${guestCartId}/items`, payload);
            const image = await getProductImage(response.data.sku);
            return  { ...response.data, image } as CartItem;

            }catch(error){
                console.error('inside second try/catch block: Error adding to cart:', error.response.data, error.status);
                if(error.response?.data?.parameters?.fieldName == "quoteId")
                {
                    await createGuestCart();
                    const newGuestCartId = await AsyncStorage.getItem('guestCartId');
                    const response = await axiosInstance.post(`/rest/V1/guest-carts/${newGuestCartId}/items`, payload);
                    const image = await getProductImage(response.data.sku);
                    return  { ...response.data, image } as CartItem;  

                }    else{
                    throw Error(error)
                }
                

            }
            
            
          
         
        }
        const response = await axiosInstance.post(`/rest/V1/carts/mine/items`, payload, { headers: { Authorization: `Bearer ${token}` } });
        const image = await getProductImage(response.data.sku);
        const cartData = { ...response.data, image };
        consoleLog('cartData:', JSON.stringify(cartData)); 
        return cartData as CartItem;
    } catch (error) {
        console.error('Error adding to cart:', error.response.data.message);
        ToastAndroid.show(error.response.data.message, ToastAndroid.SHORT);
        throw error;
    }
};
       
export const updateCart = async (payload: object): Promise<CartItem> => {
    try {
        const token = payload.token
        consoleLog(token)
        if (!token) {
            const guestCartId = await AsyncStorage.getItem('guestCartId');
            if (!guestCartId) {
                await createGuestCart();
            }   
            payload = { ...payload, guestCartId };
            const item_id = payload.cartItem.item_id;
            const response = await axiosInstance.put(`/rest/V1/guest-carts/${guestCartId}/items/${item_id}`, payload);
            return response.data as CartResponse;
        }   
        const item_id = payload.cartItem.item_id;
        const response = await axiosInstance.put(`/rest/V1/carts/mine/items/${item_id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
 
        return response.data as CartResponse;
    } catch (error) {
        if(axios.isAxiosError(error)){
            console.error('Error updating cart:', error.response?.data.message);
            throw Error(error.response?.data.message)

            
        }

        throw error;
    }   
};

interface DeleteCartPayload {
    itemId: string;
    token?: string;
}

export const deleteCart = async (payload: DeleteCartPayload): Promise<boolean> => {
    const { itemId, token } = payload;

    // Path 1: User is a guest (no token provided)
    if (!token) {
        const guestCartId = await AsyncStorage.getItem('guestCartId');
        if (!guestCartId) {
            // This case is unlikely but good to handle.
            console.error('Guest cart ID not found for deletion.');
            throw new Error('Guest cart not found.');
        }
        try {
            const response = await axiosInstance.delete(`/rest/V1/guest-carts/${guestCartId}/items/${itemId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting from guest cart:', error);
            throw error;
        }
    }

    // Path 2: User is logged in (token is provided)
    try {
        const response = await axiosInstance.delete(
            `/rest/V1/carts/mine/items/${itemId}`,
            // The token is used directly here
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    } catch (error) {
        console.error('Error deleting from user cart:', error);
        throw error;
    }
}; 
export const createCustomerCart = async (userToken:string): Promise<CartResponse> => {

        try {
            const response = await axiosInstance.post('/rest/V1/carts/mine', {}, { headers: { Authorization: `Bearer ${userToken}` } });
            return response.data;
        } catch (error) {
            console.error('Error creating customer cart:', error);
            throw error;
        }
    }   