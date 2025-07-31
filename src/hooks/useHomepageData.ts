// In @/hooks/useHomepageData.ts

import { useState, useEffect, useCallback } from 'react';
import { fetchHomeData, SortedLayoutItem } from '../api/homeService'; 
import { Tags } from '@/api/homepageDataApi';
import { consoleLog } from '@/utils/helpers';
import i18n from '@/utils/i18n';
// We don't need attemptOrQueue anymore, we'll build its logic directly into the hook
// for better state management.

type UseHomepageDataProps = {
  setRetryQueue: React.Dispatch<React.SetStateAction<(() => Promise<void>)[]>>;
};

const useHomepageData = ({ setRetryQueue }: UseHomepageDataProps) => {
  const [sortedLayoutData, setSortedLayoutData] = useState<SortedLayoutItem[]>([]);
  const [tags, setTags] = useState<Tags[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("")

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchHomeData();
      // If successful, update the state directly
      setSortedLayoutData(result.sortedLayoutData);
      setTags(result.tags);
    } catch (error: any) {
      // Check for network error
      const isOffline = error.message.includes('Network request failed') || !navigator.onLine; // A simple check
      
      if (isOffline) {
        setError(i18n.t("error_general"))
        consoleLog('useHomepageData is offline. Queuing its fetchData logic.');

        // *** THE CORE FIX ***
        // Create a function that knows how to fetch AND update this hook's state
        const retryLogic = async () => {
          consoleLog('Retrying homepage data fetch...');
          // Re-run the entire try block's logic
          const result = await fetchHomeData(); 
          if (result) {
            consoleLog('Homepage data refetched successfully. Updating state.');
            setSortedLayoutData(result.sortedLayoutData);
            setTags(result.tags);
            setIsLoading(false); // Also update loading state!
          } else{
            setError(i18n.t("error_general"))
          }
        };

        // Add this complete retry logic to the queue
        setRetryQueue(prevQueue => [...prevQueue, retryLogic]);
        
        // Don't set isLoading to false; we are waiting for the retry
        return; // Exit here
      } else {
        // Handle other, non-network errors
        console.error("useHomepageData failed with a non-network error:", error);
        setError(error)
      }
    }
    // This will only be reached on initial success or non-network error
    setIsLoading(false);
  }, [setRetryQueue]); // setRetryQueue is stable

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]); // This is correct

  return { sortedLayoutData, tags, isLoading, error };
};

export default useHomepageData;