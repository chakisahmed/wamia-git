import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  View, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity, 
  StyleSheet, 
  Text,
  Animated,
  RefreshControl,
  Dimensions,
  StatusBar,
  Platform
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '@react-navigation/native';
import { COLORS } from '@/constants/theme';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { Product } from '@/api/productsApi';
import ProductsRowSection from '../Components/Home/ProductsRowSection';
import ProductsGallerySection from '../Components/Home/ProductsGallerySection';
import BottomSheet2 from '../Components/BottomSheet2';
import { BannerImage, FeaturedCategory } from '@/api/homepageDataApi';
import { useTranslation } from 'react-i18next';
import { ProductLayout, SortedLayoutItem } from '@/api/homeService';
import HomeHeader from './HomeHeader';
import { addItemToCart, fetchCartItems } from '@/redux/slices/cartSlice';
import BannerSlider from './BannerSlider';
import FeaturedCategories from './FeaturedCategories';
import MainCategories from './MainCategories';
import Layout1 from './ProductLayouts/Layout1';
import Layout2 from './ProductLayouts/Layout2';
import Layout3 from './ProductLayouts/Layout3';

import SecondaryBannerSlider from './SecondaryBannerSlide';
import useHomepageData from '@/hooks/useHomepageData';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { fetchHomepageData as fetchHomepageDataHandler } from '@/redux/slices/homepageSlice';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import {
  useRecentlyViewedProducts,
  useBestSellerProducts,
  useNewestProducts,
} from '@/hooks/productHooks';
import * as Keychain from 'react-native-keychain';

import { setUser, setUserToken } from '@/redux/slices/authSlice';
import { getCustomerDetails } from '@/api/customerApi';
import { RootState } from '@/redux/store';
import { consoleLog } from '@/utils/helpers';
import ErrorComponent from '../Components/ErrorComponent';
import { t } from 'i18next';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Enhanced date formatting utility
const formatUserFriendlyDate = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    
    // Just now (less than 1 hour)
    if (diffInHours < 1) {
      return 'Just now';
    }
    
    // Hours ago (1-23 hours)
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }
    
    // Days ago (1-6 days)
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
    
    // This week
    if (diffInDays < 14) {
      return 'Last week';
    }
    
    // More than 2 weeks - show formatted date
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: '2-digit',
      minute: '2-digit',
    };
    
    return date.toLocaleDateString('en-US', options);
  } catch (error) {
    console.error('Date formatting error:', error);
    return dateString;
  }
};

// Enhanced Loading Component
const LoadingComponent = () => (
  <View style={styles.loadingContainer}>
    <LinearGradient
      colors={[COLORS.primary + '20', COLORS.primary + '40', COLORS.primary + '20']}
      style={styles.loadingGradient}
    >
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.loadingText}>{t("loading")}</Text>
    </LinearGradient>
  </View>
);

// Enhanced Connection Status Component


// Enhanced Scroll to Top Button
const ScrollToTopButton = ({ onPress, visible }: { onPress: () => void; visible: boolean }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: visible ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: visible ? 1 : 0.5,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, fadeAnim, scaleAnim]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.scrollToTopButton,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity onPress={onPress} style={styles.scrollToTopTouchable}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.primary + 'CC']}
          style={styles.scrollToTopGradient}
        >
          <Ionicons name="arrow-up" size={24} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const Home = ({ navigation }: { navigation: Navigator }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { colors } = theme;
  const moresheet2 = useRef<any>(null);
  const { t } = useTranslation();
  const flatListRef = useRef<FlatList<SortedLayoutItem>>(null);
  const [retryQueue, setRetryQueue] = useState<(() => Promise<void>)[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const token = useSelector((state: RootState) => state.auth.userToken);

  const { sortedLayoutData, tags, isLoading: isHomepageLoading, error } = useHomepageData({ setRetryQueue });
  const { productsData: recentlyViewedProducts } = useRecentlyViewedProducts({
    skip: isHomepageLoading,
  });
  const { productsData: bestSellerProducts } = useBestSellerProducts({
    skip: isHomepageLoading
  });
  const {
    productsData: newestProducts,
    loading: newestLoading,
    fetchMore,
  } = useNewestProducts({
    skip: isHomepageLoading
  });

  const [displayScrollToTop, setDisplayScrollToTop] = useState(false);

  useEffect(()=>{
    if(!isHomepageLoading) {
      
      dispatch(fetchCartItems());
    }
  },[isHomepageLoading])

  const scrollToTop = useCallback(() => {
    flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
  }, []);

  const isOnlineRef = useRef(true);

  const retryQueuedRequests = useCallback(async () => {
    setRetryQueue(prevQueue => {
      if (prevQueue.length === 0) {
        return [];
      }
      return prevQueue;
    });

    let failedRetries: (() => Promise<void>)[] = [];
    setRetryQueue(prevQueue => {
      failedRetries = [];
      const processQueue = async () => {
        if (prevQueue.length === 0) {
          return;
        }
        consoleLog(`Retrying ${prevQueue.length} queued requests sequentially...`);
        for (const fetchFn of prevQueue) {
          try {
            await fetchFn();
            consoleLog("A queued request was retried successfully.");
          } catch (e) {
            console.error("A retried request failed:", e);
            failedRetries.push(fetchFn);
          }
        }
        if (failedRetries.length > 0) {
          consoleLog(`Re-queuing ${failedRetries.length} requests that failed the retry.`);
        }
        setRetryQueue(failedRetries);
      };
      processQueue();
      return prevQueue;
    });
  }, []);

  // Enhanced network monitoring
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const wasOffline = !isOnlineRef.current;
      const currentOnlineStatus = !!state.isConnected && state.isInternetReachable;
      
      isOnlineRef.current = currentOnlineStatus;
      setIsOnline(currentOnlineStatus);

      if (wasOffline && currentOnlineStatus) {
        consoleLog("Internet connection restored. Retrying requests.");
        retryQueuedRequests();
      }
    });

    return () => unsubscribe();
  }, [retryQueuedRequests]);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    dispatch(fetchHomepageDataHandler());
    
    const fetchUserToken = async () => {
      try {
        const tokenData = await Keychain.getGenericPassword();
        if (tokenData && !signal.aborted) {
          consoleLog("Token recalled");
          const customer = await getCustomerDetails(tokenData.password);
          dispatch(setUserToken(tokenData.password));
          dispatch(setUser(customer));
        }
      } catch (error) {
        console.error('Failed to fetch user token:', error);
      }
    };

    fetchUserToken();

    return () => {
      controller.abort();
    };
  }, [dispatch, sortedLayoutData]);

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
              configurable_item_options: data.configurable_options.map((option) => ({
                option_id: option?.attribute_id,
                option_value: option?.values[0].value_index
              }))
            }
          }
        };
      }

      dispatch(addItemToCart({
        qty: 1,
        sku: data.configurable_options 
          ? data.sku.concat("-" + data.configurable_options.map((opt) => opt.values[0].label).join("-")) 
          : data.sku,
        name: data.name,
        price: data.price,
        cartItem,
        token
      }));
    } catch (error) {
      console.error('Error adding item to cart:', error);
    }
  }, [dispatch, token]);

  const renderLayoutComponent = useCallback((layout: SortedLayoutItem) => {
    switch (layout.type) {
      case 'banner':
        if (layout.dataSource === 'bannerImage2x2') {
          return <SecondaryBannerSlider layout={layout} />;
        }
        return <BannerSlider data={layout.data} />;

      case 'image':
        return <BannerSlider data={layout.data} />;

      case 'category':
        if (layout.dataSource === 'mainCategories') {
          return <MainCategories />;
        }
        return <FeaturedCategories data={layout.data} />;

      case 'product':
        if (layout.layoutAppearance === 'layout1') {
          return <Layout1 layout={layout} navigation={navigation} />;
        } else if (layout.layoutAppearance === 'layout2') {
          return <Layout2 layout={layout} navigation={navigation} />;
        } else if (layout.layoutAppearance === 'layout3') {
          return <Layout3 layout={layout} />;
        }
        return null;

      default:
        return null;
    }
  }, [navigation, addItemToCartHandler]);

  const handleScroll = useCallback((e: any) => {
    const { contentOffset } = e.nativeEvent;
    const shouldShowButton = contentOffset.y > 1000;
    
    if (shouldShowButton !== displayScrollToTop) {
      setDisplayScrollToTop(shouldShowButton);
    }
  }, [displayScrollToTop]);

  const onEndReachedHandler = useCallback(() => {
    if (newestLoading || !newestProducts || newestProducts.items.length >= newestProducts.total_count) {
      return;
    }
    fetchMore({
      variables: {
        currentPage: Math.floor(newestProducts.items.length / 20) + 1,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult?.products.items.length) return prev;
        return {
          ...prev,
          products: {
            ...prev.products,
            items: [...prev.products.items, ...fetchMoreResult.products.items],
          },
        };
      },
    });
  }, [newestLoading, newestProducts, fetchMore]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchHomepageDataHandler());
      await retryQueuedRequests();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, retryQueuedRequests]);

  const renderHeader = useMemo(() => (
    <HomeHeader 
      tags={tags} 
      ref={moresheet2} 
      openDrawer={() => dispatch({ type: 'OPEN_DRAWER' })} 
      navigation={navigation} 
    />
  ), [tags, moresheet2, dispatch, navigation]);

  const renderFooter = useMemo(() => (
    <View style={styles.footerContainer}>
      <ProductsRowSection 
        title={t('recently_viewed')} 
        products={recentlyViewedProducts?.items} 
      />
      <ProductsGallerySection 
        title={t('best_sellers')} 
        products={bestSellerProducts?.items} 
      />
      <ProductsGallerySection 
        title={t('recent_products')} 
        products={newestProducts?.items} 
      />
      <View style={styles.footerSpacing} />
    </View>
  ), [t, recentlyViewedProducts, bestSellerProducts, newestProducts, addItemToCartHandler]);

  const renderEmptyComponent = useMemo(() => {
    if (isHomepageLoading && !error) {
      return <LoadingComponent />;
    }
    return (
      <ErrorComponent
        message={error?.message || t('error_general')}
        onRetry={retryQueuedRequests}
      />
    );
  }, [isHomepageLoading, error, retryQueuedRequests]);

  return (
    <ErrorBoundary>
      <StatusBar 
        barStyle={colors.background === '#000000' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        
        <FlatList
          ref={flatListRef}
          data={sortedLayoutData}
          keyExtractor={(item, index) => `${item.type}-${index}`}
          renderItem={({ item }) => renderLayoutComponent(item)}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmptyComponent}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={21}
          removeClippedSubviews={true}
          onEndReached={onEndReachedHandler}
          onEndReachedThreshold={0.3}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
              title="Pull to refresh"
              titleColor={colors.text}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        />
        
        <ScrollToTopButton
          visible={displayScrollToTop}
          onPress={scrollToTop}
        />
        
        <BottomSheet2 ref={moresheet2} />
      </View>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingGradient: {
    paddingHorizontal: 40,
    paddingVertical: 30,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  scrollToTopButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    zIndex: 100,
  },
  scrollToTopTouchable: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  scrollToTopGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerContainer: {
    paddingBottom: 20,
  },
  footerSpacing: {
    height: 80,
  },
});

export { formatUserFriendlyDate };
export default Home;