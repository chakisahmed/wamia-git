// apolloClient.js
import { ApolloClient, Cache, InMemoryCache, NormalizedCacheObject, createHttpLink, from } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setContext } from '@apollo/client/link/context';
import { timingLink } from '../utils/timingLink';
import { timeoutLink } from '../utils/timeoutApollo';
const TIMEOUT = 25_000; // 25s
const WARN = 12_000; 
import * as Keychain from 'react-native-keychain';


const authLink = setContext(async (_, { headers }) => {
  // Get the authentication token from Keychain on each request
  try {
    const token = await Keychain.getGenericPassword();

    // Return the headers to the context so httpLink can read them
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token.password}` : '',
      }
    }
  } catch (error) {
    console.error('Error getting token from keychain for Apollo Link', error);
    return {
      headers,
    };
  }
});
const link = from([
  timeoutLink(WARN, TIMEOUT),  // <-- must come before httpLink
  timingLink,
  authLink.concat(createHttpLink({ uri: 'https://www.wamia.tn/graphql' }))
]);

const cache = new InMemoryCache();

// Internal variable to hold the client instance once created
let apolloClient: ApolloClient<NormalizedCacheObject> | null = null;

/**
 * Initialize Apollo Client with persisted cache.
 * Call this in your app’s entry point before using the client.
 */
export async function initApolloClient() {
   
  
  apolloClient = new ApolloClient({
    link,
    cache,
    defaultOptions: {
      query: {
        errorPolicy: 'all',
      },
    },
  });
  
  return apolloClient;
}

/**
 * Getter to retrieve the initialized Apollo Client.
 * This will throw if the client isn’t initialized yet.
 */
export function getApolloClient() {
  if (!apolloClient) {
    throw new Error("Apollo client is not initialized. Make sure to call initApolloClient() first.");
  }
  return apolloClient;
}
