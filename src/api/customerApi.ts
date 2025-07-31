import { AxiosError } from 'axios';
import axiosInstance from './axiosConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import { consoleLog } from '../utils/helpers';
import i18n from '@/utils/i18n';

export interface CustomerDetails {
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
    addresses: {
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
    }[];
    disable_auto_group_change: number;
    extension_attributes: {
        is_subscribed: boolean;
    };
    custom_attributes: {
        attribute_code: string;
        value: string;
    }[];
}



/**
 * Clears user credentials from Keychain and performs other logout tasks.
 * This is a robust way to handle session termination.
 */
export const logout = async (): Promise<void> => {
    try {
        await Keychain.resetGenericPassword();
        // You can also clear other state here, e.g., from Redux, Zustand, or AsyncStorage
        consoleLog('User credentials cleared.');
    } catch (error) {
        console.error("Could not clear credentials during logout:", error);
    }
};

/**
 * Fetches customer details from the API.
 * It will use the provided token or attempt to retrieve one from the Keychain.
 *
 * @param userToken An optional token to use for the request.
 * @returns A Promise that resolves with the customer's details.
 * @throws {AxiosError} Throws a specific error for authentication failures ('401')
 * or re-throws other network/server errors.
 */
export const getCustomerDetails = async (userToken?: string): Promise<CustomerDetails | null> => {
    try {
        let tokenToUse: string | null = userToken || null;

        // 1. If no token was passed in, try to get it from the Keychain.
        // This is the correct way to check for credentials. `getGenericPassword`
        // returns `false` or `null` if nothing is found, it does not throw.
        if (!tokenToUse) {
            const credentials = await Keychain.getGenericPassword();
            if (credentials) {
                tokenToUse = credentials.password;
            }
        }

        // 2. If we still don't have a token, the user is not authenticated.
        // Throw a specific, recognizable error that can be caught to trigger a login flow.
        if (!tokenToUse) {
            throw new AxiosError('No authentication token found. Please log in.', 'NO_TOKEN_FOUND');
        }

        // 3. Make the API call using the determined token.
        const response = await axiosInstance.get<CustomerDetails>('rest/V1/customers/me', {
            headers: {
                Authorization: `Bearer ${tokenToUse}`,
            },
        });

        consoleLog("customer details",JSON.stringify(response.data))

        return response.data;

    } catch (error: any) {
        // 4. Handle all errors, paying special attention to authentication failures.
        const isUnauthorized = 
            error?.response?.status === 401 || // From an actual API response
            error?.code === 'NO_TOKEN_FOUND';    // From our check in step 2

        if (isUnauthorized) {
            // The token is missing, invalid, or expired.
            // Clear all stored credentials to force a re-login.
            await logout();
            
            // Re-throw a standardized error for the UI layer to handle (e.g., redirect to Login screen).
            return null
        }

        // For all other errors (network issues, 500 server errors, etc.), re-throw them.
        console.error("An unexpected error occurred in getCustomerDetails:", error);
        throw error;
    }
};
interface UpdateCustomerDetailsParams{
firstName?:string
lastName?:string,
email?:string,

}
export const updateCustomerDetails = async (customer: UpdateCustomerDetailsParams): Promise<CustomerDetails> => {
    try {
        const token = await Keychain.getGenericPassword();
        if (!token) {
            throw new AxiosError('No token found', "401");
        }

        const response = await axiosInstance.put<CustomerDetails>('rest/V1/customers/me', customer, {
            headers: {
                Authorization: `Bearer ${token.password}`
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error updating customer details:', error.response.data.message);
        throw error.response.data.message;
    }

}
export const isEmailAvailable = async (customerEmail: string): Promise<boolean> => {
    try {
        const response = await axiosInstance.post<boolean>('rest/V1/customers/isEmailAvailable', { customerEmail });
        return response.data;
    } catch (error) {
        console.error('Error checking email availability:', error);
        throw error;
    }
};