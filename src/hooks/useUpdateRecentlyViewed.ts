import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENTLY_VIEWED_KEY = 'recentlyViewed';

/**
 * A custom hook that tracks a recently viewed product SKU in AsyncStorage.
 * If the SKU is already in the list, it moves it to the front.
 * If it's not in the list, it adds it to the front.
 * 
 * @param sku The product SKU to track. The hook will not run if the SKU is null or undefined.
 */
export const useUpdateRecentlyViewed = (sku: string | undefined | null) => {
    
    useEffect(() => {
        // Guard clause: Do nothing if the SKU isn't provided.
        if (!sku) {
            return;
        }

        const updateStorage = async () => {
            try {
                const existingSkusRaw = await AsyncStorage.getItem(RECENTLY_VIEWED_KEY);
                const existingSkus = existingSkusRaw ? existingSkusRaw.split(',') : [];

                // Remove the current SKU if it already exists to avoid duplicates
                // and ensure it can be moved to the front.
                const filteredSkus = existingSkus.filter(s => s !== sku);
                
                // Add the new SKU to the beginning of the array (most recent)
                const updatedSkus = [sku, ...filteredSkus];

                // Optional: Limit the number of recently viewed items
                // const limitedSkus = updatedSkus.slice(0, 20); // Keep only the latest 20

                await AsyncStorage.setItem(RECENTLY_VIEWED_KEY, updatedSkus.join(','));

            } catch (error) {
                console.error('Failed to update recently viewed products in AsyncStorage:', error);
            }
        };

        updateStorage();

    // This effect should re-run ONLY when the product SKU changes.
    }, [sku]); 
};