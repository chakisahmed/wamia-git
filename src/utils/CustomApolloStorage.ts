// CustomFilteredStorage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export class FilteredStorage {
  async getItem(key: string) {
    return await AsyncStorage.getItem(key);
  }
  async setItem(key: string, value: string) {
    // Parse the entire cache data
    let data;
    try {
      data = JSON.parse(value);
    } catch (error) {
      console.error('Error parsing cache data', error);
      return await AsyncStorage.setItem(key, value);
    }
    
    // Filter ROOT_QUERY so only keys starting with "categories(" are kept
    if (data.ROOT_QUERY) {
      const filteredRootQuery: { [key: string]: any } = {};
      Object.keys(data.ROOT_QUERY).forEach(cacheKey => {
        if (cacheKey.startsWith('categories(') || cacheKey.startsWith('products(')) {
          filteredRootQuery[cacheKey] = data.ROOT_QUERY[cacheKey];
        }
      });
      data.ROOT_QUERY = filteredRootQuery;
    }
    
    // Save the filtered data back as a string
    return await AsyncStorage.setItem(key, JSON.stringify(data));
  }
  async removeItem(key: string) {
    return await AsyncStorage.removeItem(key);
  }
}
