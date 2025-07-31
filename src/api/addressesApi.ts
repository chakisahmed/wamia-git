import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from './axiosConfig';
import * as Keychain from 'react-native-keychain';


// app/api/addressesApi.ts

export interface Address {
    region: string;
    region_id: string;
    region_code: string;
    country_id: string;
    street: string[];
    postcode: string;
    city: string;
    firstname: string;
    lastname: string;
    email: string;
    telephone: string;
    is_default: boolean;
}

export interface AddressesResponse {
    shipping_addresses: Address[];
    billing_addresses: Address[];
}

export const getAddresses = async (token:string): Promise<AddressesResponse> => {
    try {
        if (!token) {
            throw new Error('Token is required');
        }        
        const response = await axiosInstance.get(`/api/customer/addresses?token=${token}`);
        return response.data as AddressesResponse;
    } catch (error) {
        console.error('Error fetching addresses:', error);
        throw error;
    }      
};
export const addAddress = async (address: Address, token:string): Promise<any> => {
    try {

      if (!token) {
        throw new Error('Token is required');
      }
  
      // Fetch current customer data to retrieve existing addresses
      const customerRes = await axiosInstance.get(`rest/V1/customers/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const customerData = customerRes.data;
  
      // If no addresses exist, initialize an empty array
      const existingAddresses = customerData.addresses || [];
  
      // Construct the new address in Magento's expected format. if addreses is empty or null, set default_billing and default_shipping to true
      const newAddress = {
        firstname: address.firstname,
        lastname: address.lastname,
        street: address.street,
        city: address.city,
        region: {
          region: address.region,
          region_code: address.region_code,
          region_id: Number(address.region_id),
        },
        postcode: address.postcode,
        country_id: address.country_id,
        telephone: address.telephone,
        // Use is_default to set both default_billing and default_shipping.
        default_billing: existingAddresses.length === 0 ? true : false,
        default_shipping: existingAddresses.length === 0 ? true : false,
      };
  
      // Append the new address to existing addresses
      const updatedAddresses = [...existingAddresses, newAddress];
  
      // Build the payload to update the customer data.
      // Ensure to include required customer fields like id, email, firstname, lastname.
      const payload = {
        customer: {
          id: customerData.id,
          email: customerData.email,
          firstname: customerData.firstname,
          lastname: customerData.lastname,
          addresses: updatedAddresses,
        },
      };
  
      // Update the customer via a PUT request
      const updateRes = await axiosInstance.put(`/rest/V1/customers/me`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      return updateRes.data;
    } catch (error) {
      console.error('Error adding address:', JSON.stringify(error.response.data));
      throw error;
    }
  };
 
  
/* ========= 1. Set default shipping / billing address ========= */

export const setDefaultAddress = async (
  token:string,
  addressId: number,
  opts: { shipping?: boolean; billing?: boolean } = { shipping: true, billing: true },
) => {
  if (!token) throw new Error('Token is required');

  // 1. fetch full customer record
  const { data: customer } = await axiosInstance.get('/rest/V1/customers/me', {
    headers: { Authorization: `Bearer ${token}` },
  });

  // 2. strip out any per-address default flags
  const cleanedAddresses = (customer.addresses || []).map((addr: any) => {
    const { default_shipping, default_billing, ...rest } = addr;
    return rest;
  });

  // 3. determine fallback defaults if needed
  const newDefaultShipping = opts.shipping ? addressId : customer.default_shipping;
  const newDefaultBilling  = opts.billing  ? addressId : customer.default_billing;

  // 4. build payload with only top-level default flags
  const payload = {
    customer: {
      id: customer.id,
      email: customer.email,
      firstname: customer.firstname,
      lastname: customer.lastname,
      addresses: cleanedAddresses,
      default_shipping: newDefaultShipping,
      default_billing:  newDefaultBilling,
    },
  };

  // 5. send update
  return axiosInstance.put('/rest/V1/customers/me', payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
};


/* ========= 2. Remove an address ========= */


export const removeAddress = async (token:string,addressId: number) => {
  if (!token) throw new Error('Token is required');
  
  // 1. load customer + addresses
  const { data: customer } = await axiosInstance.get('/rest/V1/customers/me', {
    headers: { Authorization: `Bearer ${token}` },
  });

  // 2. filter out the to-be-deleted address
  const remaining = (customer.addresses || []).filter((a: any) => a.id !== addressId);

  // 3. choose fallback (first remaining) or null
  const firstRemaining = remaining.length ? remaining[0].id : null;

  // 4. clean any per-address default flags
  const cleaned = remaining.map((addr: any) => {
    const { default_shipping, default_billing, ...rest } = addr;
    return rest;
  });

  // 5. mark the fallback address as default on its object
  const marked = cleaned.map((addr: any) => {
    if (addr.id === firstRemaining) {
      return {
        ...addr,
        default_shipping: true,
        default_billing: true,
      };
    }
    return addr;
  });

  // 6. build top-level defaults
  const payload = {
    customer: {
      id: customer.id,
      email: customer.email,
      firstname: customer.firstname,
      lastname: customer.lastname,
      addresses: marked,
      default_shipping: firstRemaining,
      default_billing: firstRemaining,
    },
  };

  // 7. send update
  return axiosInstance.put('/rest/V1/customers/me', payload, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
};

  