import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from './axiosConfig';
import * as Keychain from 'react-native-keychain';

/**
 * Applies a coupon code to the current cart (quote).
 *
 * @param couponCode The coupon code to apply.
 * @returns A boolean indicating if the coupon was applied successfully.
 */
export const applyCouponCode = async (couponCode: string): Promise<boolean> => {
    if (!couponCode) {
        throw new Error('Coupon code cannot be empty.');
    }

    try {
        const credentials = await Keychain.getGenericPassword();

        // --- Logged-in User Workflow ---
        if (credentials) {
            const response = await axiosInstance.put(
                // Use the endpoint for the customer's own cart
                `/rest/V1/carts/mine/coupons/${couponCode}`,
                {}, // PUT request with an empty body
                { headers: { Authorization: `Bearer ${credentials.password}` } }
            );
            return response.data; // Magento returns `true` on success
        }

        // --- Guest User Workflow ---
        const guestCartId = await AsyncStorage.getItem('guestCartId');
        if (!guestCartId) {
            throw new Error('Guest cart does not exist. Cannot apply coupon.');
        }

        const response = await axiosInstance.put(
            // Use the endpoint for a specific guest cart
            `/rest/V1/guest-carts/${guestCartId}/coupons/${couponCode}`
        );
        return response.data; // Magento returns `true` on success

    } catch (error) {
        // Provide a more specific error message from the Magento API response
        const errorMessage = error.response?.data?.message || 'Error applying coupon code.';
        console.error('API Error applying coupon:', errorMessage);
        // Re-throw the specific message to be displayed in the UI
        throw new Error(errorMessage);
    }
};

/**
 * Removes the currently applied coupon code from the cart.
 *
 * @returns A boolean indicating if the coupon was removed successfully.
 */
export const removeCouponCode = async (): Promise<boolean> => {
    try {
        const credentials = await Keychain.getGenericPassword();

        // --- Logged-in User Workflow ---
        if (credentials) {
            const response = await axiosInstance.delete(
                `/rest/V1/carts/mine/coupons`,
                { headers: { Authorization: `Bearer ${credentials.password}` } }
            );
            return response.data;
        }

        // --- Guest User Workflow ---
        const guestCartId = await AsyncStorage.getItem('guestCartId');
        if (!guestCartId) {
            throw new Error('Guest cart does not exist.');
        }

        const response = await axiosInstance.delete(
            `/rest/V1/guest-carts/${guestCartId}/coupons`
        );
        return response.data;

    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Error removing coupon code.';
        console.error('API Error removing coupon:', errorMessage);
        throw new Error(errorMessage);
    }
};