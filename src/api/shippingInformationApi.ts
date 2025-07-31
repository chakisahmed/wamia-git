import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from './axiosConfig';
import { createGuestCart } from './cartApi';
import * as Keychain from 'react-native-keychain';

// app/api/shippingInformationApi.ts

export interface Address {
    region: any;
    region_id: number;
    region_code: string;
    country_id: string;
    street: string[];
    postcode: string;
    city: string;
    firstname: string;
    lastname: string;
    email: string;
    telephone: string;
}

export interface AddressInformation {
    shipping_address: Address;
    billing_address: Address;
    shipping_carrier_code: string;
    shipping_method_code: string;
}

export interface ShippingInformationPayload {
    addressInformation: AddressInformation;
}

interface PaymentMethod {
    code: string;
    title: string;
}

interface Totals {
    grand_total: number;
    base_grand_total: number;
    subtotal: number;
    base_subtotal: number;
    discount_amount: number;
    base_discount_amount: number;
    subtotal_with_discount: number;
    base_subtotal_with_discount: number;
    shipping_amount: number;
    base_shipping_amount: number;
    shipping_discount_amount: number;
    base_shipping_discount_amount: number;
    tax_amount: number;
    base_tax_amount: number;
    weee_tax_applied_amount: null | number;
    shipping_tax_amount: number;
    base_shipping_tax_amount: number;
    subtotal_incl_tax: number;
    shipping_incl_tax: number;
    base_shipping_incl_tax: number;
    base_currency_code: string;
    quote_currency_code: string;
    items_qty: number;
    items: any[];
    total_segments: any[];
}

export interface ShippingInformationResponse {
    payment_methods: PaymentMethod[];
    totals: Totals|null;
}

export const postShippingInformation = async (
    payload: ShippingInformationPayload
): Promise<ShippingInformationResponse> => {
    try {
        const regionShipping = payload.addressInformation.shipping_address as any;
            const regionBilling = payload.addressInformation.billing_address as any;
            // copy of regionShipping and regionBilling but without custom_attributes default_shipping and default_billing
            const { default_shipping, default_billing,custom_attributes,id,customer_id, ...regionShippingCopy } = regionShipping;
            const { default_shipping: defaultShippingBilling, default_billing: defaultBillingBilling,custom_attributes:custom_attributes2,id:id2,customer_id:customer_id2, ...regionBillingCopy } = regionBilling;
            const updatedPayload = {
                ...payload,
                addressInformation: {
                ...payload.addressInformation,
                shipping_address: {
                    ...regionShippingCopy,
                    region: regionShippingCopy.region.region as string,
                    region_id: regionShippingCopy.region.region_id,
                    region_code: regionShippingCopy.region.region_code,
                },    
                billing_address: {
                    ...regionBillingCopy,
                    region: regionBillingCopy.region.region as string,
                    region_id: regionBillingCopy.region_id,
                    region_code: regionBillingCopy.region_code,
                },
                },
            } as ShippingInformationPayload;
        const token = await Keychain.getGenericPassword();;
        if (!token) {       
            //throw new Error('Token is required');
            //check if guest cart id is stored in async storage
            const guestCartId = await AsyncStorage.getItem('guestCartId');
            
            if (!guestCartId) {
                await createGuestCart();
            }    
            const response = await axiosInstance.post(
                `/rest/V1/guest-carts/${guestCartId}/shipping-information`,
                updatedPayload,);
            return response.data;

        } 


        const response = await axiosInstance.post(
            `/rest/V1/carts/mine/shipping-information`,
            updatedPayload,
            { headers: { Authorization: `Bearer ${token.password}` } }
        );
        //return {payment_methods: [], totals: null};
        return response.data;
    } catch (error) {
        console.error('Error posting shipping information:', error);
        throw error;    
    }
    //exemple of method call
    // const shippingInformation = await postShippingInformation({
    //     addressInformation: {
    //         shipping_address: addresses.shipping,
    //         billing_address: addresses.billing,
    //         shipping_carrier_code: 'flatrate',
    //         shipping_method_code: 'flatrate',
    //     },
    // });

};