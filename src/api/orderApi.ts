import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from './axiosConfig';
import { assignGuestCartToCustomer, createGuestCart } from './cartApi';
import { getCustomerDetails } from './customerApi';
import { MAGE_TOKEN } from '@env';
import * as Keychain from 'react-native-keychain';  


  
export interface OrderItem {
    entity_id: number;
    total_due: number;
    increment_id: number;
    total_qty_ordered: number;
    amount_refunded: number;
    base_amount_refunded: number;
    base_grand_total: number;
    base_discount_amount: number;
    base_discount_invoiced: number;
    base_discount_tax_compensation_amount: number;
    base_original_price: number;
    base_price: number;
    base_price_incl_tax: number;
    base_row_invoiced: number;
    base_row_total: number;
    base_row_total_incl_tax: number;
    base_tax_amount: number;
    base_tax_invoiced: number;
    created_at: string;
    discount_amount: number;
    discount_invoiced: number;
    discount_percent: number;
    free_shipping: number;
    discount_tax_compensation_amount: number;
    discount_tax_compensation_canceled: number;
    is_qty_decimal: number;
    is_virtual: number;
    item_id: number;
    name: string;
    no_discount: number;
    order_id: number;
    original_price: number;
    price: number;
    price_incl_tax: number;
    product_id: number;
    product_type: string;
    qty_canceled: number;
    qty_invoiced: number;
    qty_ordered: number;
    qty_refunded: number;
    qty_shipped: number;
    quote_item_id: number;
    row_invoiced: number;
    row_total: number;
    row_total_incl_tax: number;
    row_weight: number;
    sku: string;
    store_id: number;
    tax_amount: number;
    tax_canceled: number;
    tax_invoiced: number;
    tax_percent: number;
    updated_at: string;
    weight: number;
    status: string;
    base_currency_code: string;
}

interface BillingAddress {
    address_type: string;
    city: string;
    country_id: string;
    customer_address_id: number;
    email: string;
    entity_id: number;
    firstname: string;
    lastname: string;
    parent_id: number;
    postcode: string;
    region: string;
    region_code: string;
    street: string[];
    telephone: string;
}

interface Payment {
    account_status: string | null;
    additional_information: string[];
    amount_ordered: number;
    base_amount_ordered: number;
    base_shipping_amount: number;
    cc_exp_year: string;
    cc_last4: string | null;
    cc_ss_start_month: string;
    cc_ss_start_year: string;
    entity_id: number;
    method: string;
    parent_id: number;
    shipping_amount: number;
}

interface ShippingTotal {
    base_shipping_amount: number;
    base_shipping_canceled: number;
    base_shipping_discount_amount: number;
    base_shipping_discount_tax_compensation_amnt: number;
    base_shipping_incl_tax: number;
    base_shipping_tax_amount: number;
    shipping_amount: number;
    shipping_canceled: number;
    shipping_discount_amount: number;
    shipping_discount_tax_compensation_amount: number;
    shipping_incl_tax: number;
    shipping_tax_amount: number;
}

interface Shipping {
    total: ShippingTotal;
}

interface ShippingAssignment {
    shipping: Shipping;
    items: OrderItem[];
}

interface ExtensionAttributes {
    shipping_assignments: ShippingAssignment[];
    payment_additional_info: { key: string; value: string }[];
    applied_taxes: any[];
    item_applied_taxes: any[];
}

interface OrderResponse {
    items: OrderItem[];
    total_count: number;
}
export const getOrder = async (currentPage:number,user:number,status?:string,options?: { signal: AbortSignal }): Promise<OrderResponse> => {
    try {

    var params: {
        'searchCriteria[filter_groups][0][filters][0][field]': string;
        'searchCriteria[filter_groups][0][filters][0][value]': any;
        'searchCriteria[filter_groups][0][filters][0][condition_type]': string;
        'searchCriteria[currentPage]': number;
        'searchCriteria[pageSize]': number;
        'searchCriteria[filter_groups][1][filters][0][field]'?: string;
        'searchCriteria[filter_groups][1][filters][0][value]'?: string;
        'searchCriteria[filter_groups][1][filters][0][condition_type]'?: string;
        //sort
        'searchCriteria[sortOrders][0][field]': string;
        'searchCriteria[sortOrders][0][direction]': string

    } = {
        'searchCriteria[filter_groups][0][filters][0][field]': 'customer_id',
        'searchCriteria[filter_groups][0][filters][0][value]': user,
        'searchCriteria[filter_groups][0][filters][0][condition_type]': 'eq',
    
        // Pagination
        'searchCriteria[currentPage]': currentPage || 1,
        'searchCriteria[pageSize]': 20,
        // Sort
        'searchCriteria[sortOrders][0][field]': 'created_at',
        'searchCriteria[sortOrders][0][direction]': 'DESC'
    };
        if(status && status !== 'all') {
            params = {...params,
                'searchCriteria[filter_groups][1][filters][0][field]': 'status',
                'searchCriteria[filter_groups][1][filters][0][value]': status,
                'searchCriteria[filter_groups][1][filters][0][condition_type]': 'eq',
            }
        }
        const response = await axiosInstance.get(`rest/V1/orders`, {params, signal:options?.signal, headers: {Authorization: `Bearer ${MAGE_TOKEN}`}});

        
        return response.data as OrderResponse;
    } catch (error) {
        console.error('Error fetching order:', error);
        throw error;
    }
};
export const getOrderById = async (orderId: number | string): Promise<OrderItem> => {
    try {
        const response = await axiosInstance.get(`rest/V1/orders/${orderId}`, {
            headers: { Authorization: `Bearer ${MAGE_TOKEN}` }
        });
        
        return response.data as OrderItem;
    } catch (error) {
        console.error(`Error fetching order #${orderId}:`, error);
        throw error;
    }
};

export const createOrder = async (payload: any): Promise<any> => {
    try {
    
        const billing = payload.billing_address as any;
        // copy of regionShipping and regionBilling but without custom_attributes default_shipping and default_billing
        const { default_shipping, default_billing,custom_attributes,id,customer_id, ...billingCopy } = billing;
        const updatedPayload = {
            ...payload,
            billing_address: {
                ...billingCopy,
                region: billingCopy.region.region as string,
                region_id: billingCopy.region.region_id,
                region_code: billingCopy.region.region_code,
            },
            paymentMethod: payload.paymentMethod
            
        };
        
        const response = await axiosInstance.post(`rest/V1/carts/mine/payment-information`, updatedPayload, {headers: {Authorization: `Bearer ${payload.token}`}});
        await createGuestCart();
        await assignGuestCartToCustomer(payload.customer);
        return response.data;
    } catch (error) {
        console.error('Error creating order:', error.response.data);
        throw error;
    }
};