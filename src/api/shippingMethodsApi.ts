import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from './axiosConfig';
import { createGuestCart } from './cartApi';
import * as Keychain from 'react-native-keychain';

interface Address {
    country_id: string;
    street: string[];
    telephone: string;
    postcode: string;
    city: string;
    firstname: string;
    lastname: string;
    email: string;
    same_as_billing: number;
    customer_address_id: number;
    save_in_address_book: number;
}

export interface ShippingMethod {
    carrier_code: string;
    method_code: string;
    carrier_title: string;
    method_title: string;
    amount: number;
    base_amount: number;
    available: boolean;
    error_message: string;
    price_excl_tax: number;
    price_incl_tax: number;
}

export const estimateShippingMethods = async (address: Address): Promise<ShippingMethod[]> => {
    try {
        const token = await Keychain.getGenericPassword();;
        if (!token) {       
            //throw new Error('Token is required');
            //check if guest cart id is stored in async storage
            const guestCartId = await AsyncStorage.getItem('guestCartId');
            if (!guestCartId) {
                await createGuestCart();
            }   
            

            //const reformattedAddress = {...address,region:address.region?.region,region_id:address.region?.region_id}; 

            const response = await axiosInstance.post(`/rest/V1/guest-carts/${guestCartId}/estimate-shipping-methods`, { address } );
            return response.data;
        }
        var reformattedAddress = null;
        
            //check if region is an object or a string
            if (typeof address.region === 'object') {
                
                reformattedAddress = { ...address, region: address.region?.region, region_id: address.region?.region_id };
                const {default_billing,default_shipping,...reformattedAddress2} = reformattedAddress;
                reformattedAddress = reformattedAddress2;
            }
                  
                    
        const response = await axiosInstance.post(
            `/rest/V1/carts/mine/estimate-shipping-methods`,
            {  address: reformattedAddress ?? address },
            { headers: { Authorization: `Bearer ${token.password}` } }
        );

        return response.data;
    } catch (error) {
        console.error('Error estimating shipping methods:', error.response?.data.message);
        throw error;
    }
};

// Example usage
// const address = {
//     country_id: "TN",
//     street: ["Tunis"],
//     telephone: "94519085",
//     postcode: "1990",
//     city: "Tunis",
//     firstname: "Ahmed",
//     lastname: "Chakis",
//     email: "chakisahmed@gmail.com",
//     same_as_billing: 0,
//     customer_address_id: 145367,
//     save_in_address_book: 0
// };