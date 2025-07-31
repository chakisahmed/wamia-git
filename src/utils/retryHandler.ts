// @/utils/retryHandler.ts

import NetInfo from '@react-native-community/netinfo';
import { ToastAndroid } from 'react-native';
import { consoleLog } from './helpers';

// Define the type for the state setter function
type RetryQueueSetter = React.Dispatch<React.SetStateAction<(() => Promise<void>)[]>>;

/**
 * An enhanced retry utility that attempts an API call and queues it for later if offline.
 * @param apiCall The async function to execute.
 * @param setRetryQueue The state setter function for the retry queue.
 */
export const attemptOrQueue = async <T>(
  apiCall: () => Promise<T>,
  setRetryQueue: RetryQueueSetter,
): Promise<T | null> => {
  try {
    // Attempt the API call
    const result = await apiCall();
    return result;
  } catch (error: any) {
    const netInfoState = await NetInfo.fetch();
    const isOffline = !netInfoState.isConnected || !netInfoState.isInternetReachable;

    // Check if the error is due to being offline
    if (isOffline) {
      consoleLog('Offline: Queuing request for later.');
      ToastAndroid.show('You are offline. Action will be retried when connection returns.', ToastAndroid.LONG);
      
      // Add the original apiCall function to the queue
      const requestToRetry = async () => {
        consoleLog('Retrying a queued request...');
        await apiCall();
      };

      setRetryQueue(prevQueue => [...prevQueue, requestToRetry]);
      
      // Return null or a specific indicator so the app knows it didn't succeed
      return null;
    } else {
      // If it's another type of error (e.g., 404, 500), re-throw it to be handled normally
      console.error('API call failed for a reason other than network:', error);
      throw error;
    }
  }
};