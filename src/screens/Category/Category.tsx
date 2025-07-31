// app/screens/Category/Category.tsx

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import {
  CategoryType,
} from '@/api/categoriesApi';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigation/RootStackParamList';
import { COLORS, FONTS } from '@/constants/theme';
import { useTheme } from '@react-navigation/native';
import Header from '@/layout/Header';
import { Image } from 'expo-image';
import { useDispatch, useSelector } from 'react-redux';
import { useCategories, useFirstLevelCategories } from '@/hooks/categoriesHook';
import ErrorComponent from '../Components/ErrorComponent';
import { consoleLog } from '@/utils/helpers';
// Constants for layout
const screenWidth = Dimensions.get('window').width;
const TAB_ITEM_WIDTH = 100; // adjust if necessary

// -----------------------------
// Memoized First-Level Category Item
// -----------------------------
type FirstLevelCategoryItemProps = {
  item: CategoryType;
  isSelected: boolean;
  onSelect: (id: string) => void;
  theme: any;
};

const FirstLevelCategoryItem = React.memo(
  ({ item, isSelected, onSelect, theme }: FirstLevelCategoryItemProps) => {
    const containerStyle = useMemo(
      () => [
        { backgroundColor: theme.dark ? COLORS.darkBackground : 'white' },
        styles.tabBarItem,
        isSelected && styles.tabBarItemSelected,
      ],
      [theme.dark, isSelected]
    );

    const textStyle = useMemo(
      () => [
        { color: theme.dark ? COLORS.primaryLight : theme.colors.text },
        styles.tabBarText,
        isSelected && { color: theme.dark ? 'white' : COLORS.primary, ...styles.tabBarTextSelected },
      ],
      [theme.dark, theme.colors.text, isSelected]
    );

    return (
      <TouchableOpacity style={containerStyle} onPress={() => onSelect(item.id)}>
        <Text style={textStyle}>{item.name.toUpperCase()}</Text>
      </TouchableOpacity>
    );
  }
);


// -----------------------------
// Memoized Horizontal Subcategory Item
// -----------------------------
type HorizontalSubcategoryItemProps = {
  item: CategoryType;
  navigation: any;
  theme: any;
};

const HorizontalSubcategoryItem = React.memo(
  ({ item, navigation, theme }: HorizontalSubcategoryItemProps) => {
    const handlePress = useCallback(() => {
      navigation.navigate('Products', { category: item });
    }, [navigation, item]);

    return (
      <TouchableOpacity style={styles.horizontalSubcategoryItem} onPress={handlePress}>
        <Image
          source={{
            uri: 'https://www.wamia.tn/media/catalog/category/' + item.magefan_og_image,
          }}
          style={[{ borderColor: '#AAA' }, styles.horizontalSubcategoryImage]}
        />
        <Text style={[{ color: theme.dark ? COLORS.darkTitle : COLORS.black }, styles.horizontalSubcategoryText]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  }
);

// -----------------------------
// Memoized Subcategory Item (with Grandchildren)
// -----------------------------
type SubcategoryItemProps = {
  item: CategoryType;
  navigation: any;
  theme: any;
};

const SubcategoryItem = React.memo(
  ({ item, navigation, theme }: SubcategoryItemProps) => {
    const handlePress = useCallback(() => {
      navigation.navigate('Products', { category: item });
    }, [navigation, item]);

    // Render grandchildren if available.
    const renderGrandchildCategory = useCallback(
      ({ item: grandchild }: { item: CategoryType }) => (
        <GrandchildCategoryItem item={grandchild} navigation={navigation} theme={theme} />
      ),
      [navigation, theme]
    );

    return (
      <View style={{ backgroundColor: theme.dark ? COLORS.dark : 'white', marginBottom: 12 }}>
        <TouchableOpacity style={styles.subcategoryItem} onPress={handlePress}>
          <Text style={[{ color: theme.dark ? COLORS.primaryLight : theme.colors.text }, styles.subcategoryText]}>
            {item.name}
          </Text>
        </TouchableOpacity>
        {item.children && item.children.length > 0 ? (
          <FlatList
            style={{ marginTop: 10 }}
            data={item.children}
            renderItem={renderGrandchildCategory}
            keyExtractor={(child) => child.id}
            numColumns={3}
            contentContainerStyle={styles.gridContainer}
          />
        ) : (
          <Text style={styles.noThirdLevelText}>No subcategories available.</Text>
        )}
      </View>
    );
  }
);

// -----------------------------
// Memoized Grandchild Category Item
// -----------------------------
type GrandchildCategoryItemProps = {
  item: CategoryType;
  navigation: any;
  theme: any;
};

const GrandchildCategoryItem = React.memo(
  ({ item, navigation, theme }: GrandchildCategoryItemProps) => {
    const handlePress = useCallback(() => {
      navigation.navigate('Products', { category: item });
    }, [navigation, item]);

    return (
      <TouchableOpacity style={styles.gridItem} onPress={handlePress}>
        <Image
          source={{
            uri: item.magefan_og_image ? 'https://www.wamia.tn/media/catalog/category/' + item.magefan_og_image : "https://www.wamia.tn/media/catalog/product/placeholder/default/ph_base.jpg",
          }}
          style={styles.gridImage}
        />
        <Text style={[{ color: theme.dark ? COLORS.primaryLight : theme.colors.text }, styles.gridText]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  }
);




// =================================================================
// Main Component
// =================================================================
type CategoryScreenProps = StackScreenProps<RootStackParamList, 'Category'>;

const CategoryScreen = ({ navigation }: CategoryScreenProps) => {
  const theme = useTheme();
  const { colors } = theme;

  // 1. STATE MANAGEMENT: Drastically Simplified
  // Keep state for things the USER controls, not for server data.

  // Root categories from Redux (as requested)

  const [retryQueue, setRetryQueue] = useState<(() => Promise<void>)[]>([]);
  const [retryQueueFLC, setRetryQueueFLC] = useState<(() => Promise<void>)[]>([]);
  // The ID of the currently selected top-level category
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();

  // --- All other state for subcategories, loading, and pagination is now GONE. ---
  // const [subcategories, setSubcategories] = useState(...);
  // const [loading, setLoading] = useState(...);
  // const [currentPage, setCurrentPage] = useState(...);
  // const [hasMore, setHasMore] = useState(...);

  // 2. DATA FETCHING: Declarative & Clean
  // The hook fetches subcategories for the `selectedCategoryId`.
  // It automatically re-runs when `selectedCategoryId` changes.
  const {
    categoriesData,
    loading,
    error,
    fetchMore,
    refetch

  } = useCategories({
    parentId: selectedCategoryId,
    pageSize: 10,
    skip: !selectedCategoryId,

    setRetryQueue
  });

  const { firstLevelCategories, loading: loadingFLC, error: errorFLC, refetch: refetchFLC } = useFirstLevelCategories({ setRetryQueue: setRetryQueueFLC });

  const handleRetryFirstLevelCategories = useCallback(async () => {

    if (retryQueueFLC.length > 0) {
      consoleLog(`Executing ${retryQueueFLC.length} queued network requests...`);
      await Promise.all(retryQueueFLC.map(retryFunc => retryFunc()));
      setRetryQueueFLC([]);
    } else if (errorFLC) {

      refetchFLC();
      if (!error && !loading && firstLevelCategories.items.length > 0) {
        handleCategorySelect(firstLevelCategories.items[0].id);
      }
    }


  }, [retryQueueFLC, errorFLC, refetchFLC]); // Dependencies for useCallback

  

  const handleRetry = useCallback(async () => {

    // If there are specific network requests in the queue, execute them.
    if (retryQueue.length > 0) {
      consoleLog(`Executing ${retryQueue.length} queued network requests...`);
      // Use Promise.all to run all queued refetch operations
      await Promise.all(retryQueue.map(retryFunc => retryFunc()));
      // Clear the queue after attempting the retry
      setRetryQueue([]);
    } else if (error) {
      // Fallback for non-network errors or if the queue is empty.
      // This will simply re-trigger the last query.
      refetch();
    }
  }, [retryQueue, error, refetch]); // Dependencies for useCallback

  // The subcategories are now directly from the hook's result
  const subcategories = categoriesData?.items || [];
  const totalSubcategories = categoriesData?.total_count || 0;

  // 3. CORE LOGIC: Simplified Callbacks

  // This just updates the state. The hook handles the re-fetching.
  const handleCategorySelect = useCallback((categoryId: string) => {
    if (categoryId !== selectedCategoryId) {
      setSelectedCategoryId(categoryId);
    }
  }, [selectedCategoryId]);

  // Pagination logic is now just a wrapper around `fetchMore`.
  const loadMoreSubcategories = useCallback(() => {
    // Guard clauses: don't fetch if already loading or if all items are loaded
    if (loading || !subcategories.length || subcategories.length >= totalSubcategories) {
      return;
    }

    fetchMore({
      variables: {
        // Calculate the next page based on current item count
        currentPage: Math.floor(subcategories.length / 10) + 1,
      },
      // `updateQuery` tells Apollo how to merge the new data
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult?.categories.items.length) {
          return prev; // No new items were returned
        }
        return {
          ...prev,
          categories: {
            ...prev.categories,
            items: [...prev.categories.items, ...fetchMoreResult.categories.items],
          },
        };
      },
    });
  }, [loading, subcategories.length, totalSubcategories, fetchMore]);

useEffect(() => {
  // Guard clause: Only proceed if...
  // 1. We have fetched categories.
  // 2. A category has NOT already been selected.
  if (firstLevelCategories.items.length > 0 && !selectedCategoryId) {
    handleCategorySelect(firstLevelCategories.items[0].id);
  }
  // This effect should re-run WHENEVER the list of categories changes
  // or when the selection state changes.
}, [firstLevelCategories, selectedCategoryId, handleCategorySelect]);

  // Memoized layout function for performance
  const getItemLayout = useCallback((_, index: number) => ({ length: TAB_ITEM_WIDTH, offset: TAB_ITEM_WIDTH * index, index }), []);

  // =================================================================
  // RENDER LOGIC
  // =================================================================
  const renderFirstLevelCategory = useCallback(({ item }: { item: CategoryType }) => (
    <FirstLevelCategoryItem item={item} isSelected={item.id === selectedCategoryId} onSelect={handleCategorySelect} theme={theme} />
  ), [selectedCategoryId, handleCategorySelect, theme]);

  const renderHorizontalSubcategory = useCallback(({ item }: { item: CategoryType }) => (
    <HorizontalSubcategoryItem item={item} navigation={navigation} theme={theme} />
  ), [navigation, theme]);

  const renderSubcategory = useCallback(({ item }: { item: CategoryType }) => (
    <SubcategoryItem item={item} navigation={navigation} theme={theme} />
  ), [navigation, theme]);

  return (
    <View style={[styles.container,]}>
      <Header title="Categories" leftIcon="back" titleLeft rightIcon1="search" />


      {loadingFLC && !errorFLC ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />
      ) : errorFLC ? (

        <ErrorComponent message={''} onRetry={handleRetryFirstLevelCategories} />


      ) : (<View style={[{ backgroundColor: COLORS.primary }, styles.topPanel]}>
        <FlatList
          data={firstLevelCategories.items}
          renderItem={renderFirstLevelCategory}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          extraData={selectedCategoryId}
          getItemLayout={getItemLayout}
        />
      </View>)}
      <View style={[{ backgroundColor: theme.dark ? colors.darkBackground : COLORS.white }, styles.bottomPanel]}>
        {/* Show a full loader for initial category load, or a footer spinner for pagination */}
        {loading && !subcategories.length ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />
        ) : error ? (
          <ErrorComponent message={''} onRetry={handleRetry} />
        ) : (
          <>
            {/* Horizontal subcategory list with pagination */}
            <View style={{ backgroundColor: theme.dark ? COLORS.dark : 'white', marginBottom: 12, minHeight: 120 }}>
              <FlatList
                data={subcategories}
                renderItem={renderHorizontalSubcategory}
                keyExtractor={(item) => `h-${item.id}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                onEndReached={loadMoreSubcategories}
                onEndReachedThreshold={0.5}
                ListFooterComponent={loading ? <ActivityIndicator color={COLORS.primary} style={{ marginHorizontal: 20 }} /> : null}
              />
            </View>
            {/* Vertical list of subcategories */}
            <FlatList
              data={subcategories}
              renderItem={renderSubcategory}
              keyExtractor={(item) => `v-${item.id}`}
            />
          </>
        )}
      </View>
    </View>
  );
};

export default CategoryScreen;
// -----------------------------
// Styles
// -----------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  topPanel: {
    height: 60, // Adjust the height as needed
    backgroundColor: COLORS.primary,
  },
  bottomPanel: {
    flex: 1,
    paddingTop: 10,
  },
  tabBarItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  tabBarItemSelected: {
    borderBottomColor: '#09f',
    borderBottomWidth: 5,
  },
  tabBarText: {
    fontSize: 13,
    ...FONTS.fontMedium,
  },
  tabBarTextSelected: {
    fontWeight: 'bold',
  },
  subcategoryItem: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  subcategoryText: {
    fontSize: 16,
    ...FONTS.fontMedium,
  },
  gridContainer: {
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '30%', // Adjust as needed
    marginBottom: 10,
    alignItems: 'center',
    marginHorizontal: '1.5%',
  },
  gridImage: {
    width: 80,
    height: 80,
    resizeMode: 'cover',
    borderRadius: 40,
  },
  gridText: {
    marginTop: 5,
    fontSize: 14,
    textAlign: 'center',
    ...FONTS.fontMedium,
  },
  noThirdLevelText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#999',
    ...FONTS.fontMedium,
  },
  horizontalSubcategoryItem: {
    padding: 10,
    alignItems: 'center',
  },
  horizontalSubcategoryImage: {
    width: 80,
    height: 80,
    resizeMode: 'cover',
    borderRadius: 50, // Circular image
    borderWidth: 1,
  },
  horizontalSubcategoryText: {
    fontSize: 14,
    marginTop: 5,
    ...FONTS.fontMedium,
  },
});