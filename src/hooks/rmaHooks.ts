// src/hooks/useRmaApi.ts

import { useState, useEffect, useCallback } from 'react';
import {
    getCustomerRMA,
    getReasonsRMA,
    getCustomerOrdersRMA,
    getOrderItemsRMA,
    getResolutionsRMA,
    getRmaDetails,
    getStatusLabelsRMA,
    createRma,
    sendMessage,
    cancelRma
} from '@/api/rmaApi'; // Adjust the import path to your API file

/**
 * A generic hook factory for creating simple query hooks.
 * Not used directly, but shows the pattern for the hooks below.
 */
function useQuery<TData, TArgs extends any[]>(
    apiCall: (...args: TArgs) => Promise<TData>
) {
    return (...args: TArgs) => {
        const [data, setData] = useState<TData | null>(null);
        const [isLoading, setIsLoading] = useState(false);
        const [error, setError] = useState<unknown | null>(null);

        const fetchData = useCallback(async () => {
            // Don't fetch if the first argument (often an ID) is missing
            if (args.length > 0 && !args[0]) {
              setData(null);
              return;
            }

            setIsLoading(true);
            setError(null);
            try {
                const result = await apiCall(...args);
                setData(result);
            } catch (err) {
                setError(err);
            } finally {
                setIsLoading(false);
            }
        }, [JSON.stringify(args)]); // Refetch when arguments change

        useEffect(() => {
            fetchData();
        }, [fetchData]);

        return { data, isLoading, error, refetch: fetchData };
    };
}

// --- Specific Query Hooks ---

/**
 * Fetches all RMAs for a given customer.
 * @param customerId The ID of the customer.
 */
export const useCustomerRMA = (customerId: string | undefined) => {
    const { data, isLoading, error, refetch } = useQuery(getCustomerRMA)(customerId);
    return { rmas: data, isLoading, error, refetch };
};

/**
 * Fetches the detailed information for a single RMA.
 * @param rmaId The ID of the RMA.
 */
export const useRmaDetails = (rmaId: string | undefined) => {
    const { data, isLoading, error, refetch } = useQuery(getRmaDetails)(rmaId);
    return { rmaDetails: data, isLoading, error, refetch };
};

/**
 * Fetches the available reasons for an RMA.
 */
export const useReasonsRMA = () => {
    const { data, isLoading, error, refetch } = useQuery(getReasonsRMA)();
    return { reasons: data, isLoading, error, refetch };
};

/**
 * Fetches simplified order history for a customer to create an RMA from.
 * @param customerId The ID of the customer.
 */
export const useCustomerOrdersRMA = (customerId: string | undefined) => {
    const { data, isLoading, error, refetch } = useQuery(getCustomerOrdersRMA)(customerId);
    return { orders: data, isLoading, error, refetch };
};

/**
 * Fetches the items for a specific order.
 * @param orderId The ID of the order.
 */
export const useOrderItemsRMA = (orderId: string | undefined) => {
    const { data, isLoading, error, refetch } = useQuery(getOrderItemsRMA)(orderId);
    return { items: data, isLoading, error, refetch };
};

/**
 * Fetches the available resolutions for an order (e.g., Refund, Exchange).
 * @param orderId The ID of the order.
 */
export const useResolutionsRMA = (orderId: string | undefined) => {
    const { data, isLoading, error, refetch } = useQuery(getResolutionsRMA)(orderId);
    return { resolutions: data, isLoading, error, refetch };
};


export const useCancelRma = () => {
    const { mutate, data, isLoading, error } = useMutation(cancelRma);

    return {
        cancelRma: mutate,
        cancelledRma: data,
        isLoading,
        error
    };
};


/**
 * Fetches the map of status codes to labels.
 */
export const useStatusLabelsRMA = () => {
    const { data, isLoading, error, refetch } = useQuery(getStatusLabelsRMA)();
    return { statusLabels: data, isLoading, error, refetch };
};

function useMutation<TData, TArgs extends any[]>(
    apiCall: (...args: TArgs) => Promise<TData>
) {
    const [data, setData] = useState<TData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<unknown | null>(null);

    /**
     * The function to call to trigger the mutation.
     * It's wrapped in useCallback for performance and to ensure a stable reference.
     */
    const mutate = useCallback(async (...args: TArgs): Promise<TData> => {
        setIsLoading(true);
        setError(null);
        setData(null); // Clear previous successful data
        try {
            const result = await apiCall(...args);
            setData(result);
            return result; // Return result for promise chaining
        } catch (err) {
            setError(err);
            throw err; // Re-throw so the caller can also catch it if needed
        } finally {
            setIsLoading(false);
        }
    }, [apiCall]); // The dependency is the API function itself

    return { mutate, data, isLoading, error };
}

/**
 * A hook for creating a new RMA. Returns a function to trigger the creation.
 */
export const useCreateRma = () => {
    const { mutate, data, isLoading, error } = useMutation(createRma);

    // We can rename the returned properties for better clarity in components
    return {
        createRma: mutate, // The function to call with the payload
        createdRma: data,  // The data returned upon success
        isLoading,
        error
    };
};

export const useSendRMAMessage = () =>{
    const { mutate, data, isLoading, error } = useMutation(sendMessage);

    return{
        sendMessage: mutate,
        sentMessage: data,
        isLoading,
        error
    }


}