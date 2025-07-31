import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ScrollView, ToastAndroid } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { useRoute, useTheme } from '@react-navigation/native';
import { ImageBackground, Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

// --- Local Imports ---
import Header from '@/layout/Header';
import { RootStackParamList } from '@/navigation/RootStackParamList';
import { IMAGES } from '@/constants/Images';
import { COLORS, FONTS } from '@/constants/theme';
import { GlobalStyleSheet } from '@/constants/StyleSheet';
import { CategoryType, fetchCategories3 as fetchCategories, fetchCategory } from '@/api/categoriesApi';
import Cardstyle2 from '@/components/Card/Cardstyle2';
import Cardstyle1 from '@/components/Card/Cardstyle1';
import BottomSheet2 from '../Components/BottomSheet2';
import { addProductToWishlist as addTowishList } from '@/redux/slices/wishListSlice';
import { addItemToCart } from '@/redux/slices/cartSlice';

// --- Apollo & Custom Hooks ---
import { useProducts } from '@/hooks/productHooks'; // Main hook for fetching products
import { Product } from '@/api/productsApi'; // Type import
import { useCategories } from '@/hooks/categoriesHook';
import { RootState } from '@/redux/store';
import ErrorComponent from '../Components/ErrorComponent';

type ProductsScreenProps = StackScreenProps<RootStackParamList, 'Products'>;

interface CategoryFilterValue {
  label: string;
  value: string | number;
}

const Products = ({ navigation }: ProductsScreenProps) => {
  const { colors }: { colors: any } = useTheme();
  const { params } = useRoute();
  const { category, searchTerm, otherFilters: initialOtherFilters, page_name } = params || {};
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const sheetRef = useRef<any>(null);

  // =================================================================
  // --- STATE MANAGEMENT ---
  // =================================================================

  // UI state for view toggles and banners
  const [show, setShow] = useState(true);

  // Filter & Sort state, controlled by the user via the BottomSheet
  const [appliedFilters, setAppliedFilters] = useState<any>({});
  const [categoriesFilter, setCategoriesFilter] = useState<CategoryFilterValue | undefined>(
    category ? { label: category.name, value: category.id } : undefined
  );
  const [sortOption, setSortOption] = useState('relevance:DESC');

  // Header Category Navigation State
  const [activeCategoryId, setActiveCategoryId] = useState<string | undefined>(category?.id);
  const [previousParentCategories, setPreviousParentCategories] = useState<CategoryType[]>([]);
  const [banner, setBanner] = useState(category?.image || '');

  const cart = useSelector((state: RootState) => state.cart)

  const SortData = {
    [t("relevance")]: `relevance:DESC`,
    [t("price_low_to_high")]: `price:ASC`,
    [t("price_high_to_low")]: `price:DESC`,
    [t("newest_first")]: ``
  };

  const [retryQueue, setRetryQueue] = useState<(() => Promise<void>)[]>([]);

  // =================================================================
  // --- DATA FETCHING & DERIVED DATA ---
  // =================================================================

  // 1. Memoize variables to pass to the useProducts hook.
  const queryVariables = useMemo(() => {
    const dynamicFilters: Record<string, any> = { ...initialOtherFilters };
    const { priceRange, brand, color, size, type_alimentation } = appliedFilters;

    if (priceRange?.[0] || priceRange?.[1]) {
      dynamicFilters.price = {
        ...(priceRange[0] && { from: String(priceRange[0]) }),
        ...(priceRange[1] && { to: String(priceRange[1]) }),
      };
    }
    if (brand?.value) dynamicFilters.brand = { eq: brand.value };
    if (color?.value) dynamicFilters.couleur = { eq: color.value };
    if (size?.value) dynamicFilters.size = { eq: size.value };
    if (type_alimentation?.value) dynamicFilters.type_alimentation = { eq: type_alimentation.value };

    const [key, direction] = sortOption.split(':');
    const sort = key ? { [key]: direction || 'ASC' } : {};

    return {
      search: searchTerm ?? '',
      categoryId: categoriesFilter?.value ?? category?.id ?? '',
      otherFilters: dynamicFilters,
      sortBy: sort,
      pageSize: 50,
    };
  }, [searchTerm, category, initialOtherFilters, appliedFilters, categoriesFilter, sortOption]);

  const token = useSelector((state: RootState) => state.auth.userToken)



  // 2. Call the master hook for product data.
  const { productsData, loading, error, fetchMore, refetch } = useProducts({ 
    ...queryVariables, 
    setRetryQueue, });

  const handleRetry = useCallback(async () => {

    // If there are specific network requests in the queue, execute them.
    if (retryQueue.length > 0) {
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

  // 3. Derive filter options from the fetched product data.
  const filterOptions = useMemo(() => {
    const items = productsData?.items ?? [];
    if (items.length === 0) return { brands: [], couleurs: [], sizes: [], typeaAlimentations: [] };
    const extractUniqueValues = (key: keyof Product) => [...new Set(items.map(p => p[key]).filter(Boolean))];
    return {
      brands: extractUniqueValues('brand'),
      couleurs: extractUniqueValues('couleur'),
      sizes: extractUniqueValues('size'),
      typeaAlimentations: extractUniqueValues('type_alimentation'),
    };
  }, [productsData]);

  // =================================================================
  // --- THE FIX: Create a de-duplicated list for the FlatList ---
  // =================================================================
  const uniqueProducts = useMemo(() => {
    if (!productsData?.items) {
      return [];
    }
    // This will create a new array containing only items with a unique 'id'
    const uniqueById = Array.from(new Map(productsData.items.map(item => [item.id, item])).values());

    // (Optional but recommended) Add a warning to see if duplicates were actually found
    if (uniqueById.length < productsData.items.length) {
      console.warn('Duplicate products were found and removed from the list.');
    }

    return uniqueById;
  }, [productsData?.items]);

  // =================================================================
  // --- PAGINATION & EVENT HANDLERS ---
  // =================================================================

  const FETCH_MORE_THRESHOLD = 800

  const handleFetchMore = useCallback(() => {
    // The core fetchMore logic remains the same.
    // It's called by the scroll handler.
    if (loading || !productsData || productsData.items.length >= productsData.total_count) {
      return;
    }
    fetchMore({
      variables: {
        currentPage: Math.floor(productsData.items.length / queryVariables.pageSize) + 1,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult?.products.items.length) return prev;
        return { ...prev, products: { ...prev.products, items: [...prev.products.items, ...fetchMoreResult.products.items] } };
      },
    });
  }, [loading, productsData, fetchMore, queryVariables.pageSize]);

  const handleScroll = ({ nativeEvent }: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;

    // The critical "loading guard". If a fetch is already happening, do nothing.
    // This prevents firing the fetch dozens of times.
    if (loading) {
      return;
    }

    const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;

    // Check if the user has scrolled past our defined threshold
    if (distanceFromBottom < FETCH_MORE_THRESHOLD) {
      handleFetchMore();
    }
  };

  const handleFilterApply = (filtersFromSheet: any) => {
    setAppliedFilters(filtersFromSheet);
    setCategoriesFilter(filtersFromSheet?.category);
  };

  const handleSortApply = (sortBy: any) => {
    const sortByTerm = SortData[sortBy];
    if (sortByTerm !== sortOption) setSortOption(sortByTerm);
  };
  type CartRequest = {
    sku: string;
    qty: number;
    product_option?: any;
  };
  const addItemToCartHandler = useCallback((data: Product) => {
    try {
      let cartItem: CartRequest = { sku: data.sku, qty: 1 };
      if (data.configurable_options) {
        cartItem = {
          ...cartItem,
          product_option: {
            extension_attributes: {
              configurable_item_options: data.configurable_options.map((option) =>
              ({
                option_id: option?.attribute_id,
                option_value: option?.values[0].value_index
              })
              )
            }
          }
        };
      }



      dispatch(addItemToCart({
        qty: 1,
        sku: data.configurable_options ? data.sku.concat("-" + data.configurable_options.map((opt) => opt.values[0].label).join("-")) : data.sku,
        name: data.name,
        price: data.price,
        cartItem,
        token

      }));
      //ToastAndroid.show(t("item_added_to_cart"), ToastAndroid.SHORT);
    } catch (error) {
      console.error('Error adding item to cart:', error);
    }
  }, [dispatch]);
  const addItemToWishList = (data: any) => {
    try {
      //dispatch(addItemToCart({ cartItem:{sku:data.sku,qty:1} } as any));
      dispatch(addTowishList(data.sku));
      //ToastAndroid.show(t('item_added_to_cart'), ToastAndroid.SHORT);

    } catch (error) {
      console.error('Error adding item to cart:', error);
    }
  }

  // =================================================================
  // --- SIDE EFFECTS for non-product data (Categories, Cart) ---
  // =================================================================

  const {
    categoriesData: headerCategories, // Renamed to avoid conflicts
    loading: headerLoading,
  } = useCategories({
    parentId: activeCategoryId,
    // Skip fetching if no category is active (e.g., on a search results page with no category)
    skip: !activeCategoryId,
  });




  // =================================================================
  // --- RENDER LOGIC ---
  // =================================================================

  const calculateDiscount = (price: number, finalPrice: number) => {
    return finalPrice < price ? Math.round(((price - finalPrice) / price) * 100) : 0;
  };

  const renderProductItem = ({ item }: { item: Product }) => {
    const discount = calculateDiscount(
      item.price_range.maximum_price.regular_price.value,
      item.price_range.maximum_price.final_price.value
    );
    const imageUrl = item.media_gallery?.[0]?.url;
    if (!imageUrl) return null;

    const cardProps = {
      data: item, id: item.id, title: item.name, sku: item.sku, image: imageUrl,
      discount: discount > 0 ? `${item.price_range.maximum_price.regular_price.value.toFixed(2)} ${item.price_range.maximum_price.regular_price.currency}` : '',
      offer: discount > 0 ? `${discount}% OFF` : '',
      price: `${item.price_range.maximum_price.final_price.value.toFixed(2)} ${item.price_range.maximum_price.final_price.currency}`,
      btntitle: t('add_to_cart'),
      onPress: () => navigation.navigate('ProductsDetails', { product: item }),
    };

    if (show) {
      return (
        <View style={[GlobalStyleSheet.col50, { paddingHorizontal: 0 }]}>
          <Cardstyle1 {...cardProps} onPress3={() => addItemToWishList(item)} onPress5={() => addItemToCartHandler(item)} />
        </View>
      );
    }
    return (
      <View style={{ marginBottom: 5 }}>
        <Cardstyle2 {...cardProps} product_view={true} removebottom={true} onPress2={() => { }} onPress3={() => { }} onPress4={() => { }} />
      </View>
    );
  };

  const renderHeader = () => {
    // The data for the header is now a combination of the breadcrumbs and the hook's result
    const displayedCategories = [...previousParentCategories, ...(headerCategories.items || [])];

    // Don't render the header if there are no categories to show and it's not loading
    if (!headerLoading && displayedCategories.length === 0 && !banner) {
      return null;
    }
    return (
      <View>
        {banner && <Image source={{ uri: banner }} style={styles.banner} />}

        {headerLoading && displayedCategories.length === 0 && null }

        {displayedCategories.length > 0 && (
          <ScrollView horizontal style={{ height: undefined, paddingBottom: 10 }} showsHorizontalScrollIndicator={false}>
            {displayedCategories.map((data: CategoryType) => {
              const isGoingBack = previousParentCategories.some(p => p.id === data.id);

              return (
                <TouchableOpacity
                  activeOpacity={0.7}
                  key={data.id}
                  // The onPress handler is now synchronous and just updates state
                  onPress={() => {
                    // Update the active ID to trigger the useCategories hook
                    setActiveCategoryId(data.id);

                    // Update the filter that drives the useProducts hook
                    setCategoriesFilter({ label: data.name, value: data.id });

                    // Update the banner
                    setBanner(data.image);

                    // Manage the breadcrumbs state
                    let newPrevious = [...previousParentCategories];
                    if (isGoingBack) {
                      const parentIndex = newPrevious.findIndex(p => p.id === data.id);
                      newPrevious = newPrevious.slice(0, parentIndex);
                    } else if (activeCategoryId && !previousParentCategories.some(p => p.id === activeCategoryId)) {
                      // Find the parent object from the currently displayed list
                      const parentCategory = displayedCategories.find(c => c.id === activeCategoryId);
                      if (parentCategory) {
                        newPrevious.push(parentCategory);
                      }
                    }
                    setPreviousParentCategories(newPrevious);
                  }}
                  style={styles.categoryButton}
                >
                  <ImageBackground style={styles.categoryImageContainer} imageStyle={styles.categoryImage} source={{ uri: "https://www.wamia.tn/media/catalog/category/" + data.magefan_og_image }}>
                    {isGoingBack && <Feather name="chevron-left" size={24} color="black" style={styles.categoryBackIcon} />}
                  </ImageBackground>
                  <Text style={{ ...FONTS.fontMedium, fontSize: 13, color: colors.title }}>{data.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title={page_name ?? category?.name ?? (searchTerm ? `${t('products')}: ${searchTerm}` : t('products'))} leftIcon='back' titleRight rightIcon2={'cart'} data={cart} />
      <View style={[styles.controlsContainer, { backgroundColor: colors.card }]}>
        <TouchableOpacity activeOpacity={0.5} onPress={() => sheetRef.current.openSheet('short')} style={styles.controlButton}>
          <Image style={styles.controlIcon} source={IMAGES.list2} />
          <Text style={[FONTS.fontMedium, { fontSize: 15, color: colors.title }]}>{t('sort')}</Text>
        </TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity activeOpacity={0.5} onPress={() => sheetRef.current.openSheet('filter')} style={styles.controlButton}>
          <Image style={styles.controlIcon} source={IMAGES.filter3} />
          <Text style={[FONTS.fontMedium, { fontSize: 15, color: colors.title }]}>{t('filter')}</Text>
        </TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity onPress={() => setShow(false)} style={styles.viewToggleButton}>
          <Image style={[styles.viewToggleIcon, { tintColor: !show ? COLORS.primary : colors.text }]} source={IMAGES.list} />
        </TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity onPress={() => setShow(true)} style={styles.viewToggleButton}>
          <Image style={[styles.viewToggleIcon, { tintColor: show ? COLORS.primary : colors.text }]} source={IMAGES.grid} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={uniqueProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={show ? 2 : 1}
        key={show ? 'grid' : 'list'}
        ListHeaderComponent={renderHeader}
        onScroll={handleScroll}
        // This prop is CRITICAL for onScroll to work smoothly on Android.
        // 16 means the event will fire at most once per frame (60fps).
        scrollEventThrottle={16}
        ListFooterComponent={loading && productsData?.items && productsData.items.length > 0 ? <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: 20 }} /> : null}
        ListEmptyComponent={!error && !loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 50 }}>
            <Text style={{ ...FONTS.h5, color: colors.text }}>{t('no_products_found')}</Text>
          </View>
        ) :
          error ? (
            <View style={{ height: "100%", paddingVertical: 100, justifyContent: "center", alignContent: "center" }}>
              <ErrorComponent message={''} onRetry={handleRetry} />
            </View>
          )


            : <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
      <BottomSheet2 ref={sheetRef} onFilterApply={handleFilterApply} onSortApply={handleSortApply} productsData={{ ...filterOptions, category, headerCategories, appliedFilters }} />
    </View>
  );
};

const styles = StyleSheet.create({
  banner: { width: '100%', height: 100 },
  controlsContainer: { padding: 0, justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' },
  controlButton: { flexDirection: 'row', alignItems: 'center', gap: 5, flex: 1, justifyContent: 'center' },
  controlIcon: { height: 16, width: 16, resizeMode: 'contain' },
  separator: { width: 1, height: 40, backgroundColor: COLORS.primaryLight },
  viewToggleButton: { paddingHorizontal: 15, justifyContent: 'center', alignItems: 'center' },
  viewToggleIcon: { height: 22, width: 22, resizeMode: 'contain' },
  categoryButton: { backgroundColor: 'white', height: 35, alignItems: 'center', gap: 5, justifyContent: 'center', flexDirection: 'row', borderRadius: 34, borderWidth: 1, borderColor: '#ccc', marginTop: 10, paddingRight: 10, marginHorizontal: 5, overflow: 'hidden' },
  categoryImageContainer: { width: 34, height: 34, borderRadius: 17, alignContent: 'center', justifyContent: 'center', overflow: 'hidden' },
  categoryImage: { borderRadius: 17 },
  mainCategoryImage: { width: 34, height: 34, resizeMode: 'contain', borderRadius: 17, overflow: 'hidden' },
  categoryBackIcon: { marginLeft: 5, opacity: 0.8 },
});

export default Products;