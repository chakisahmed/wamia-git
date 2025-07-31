import { CommonActions, useTheme } from '@react-navigation/native';
import React, { act, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, Image, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import Header from '@/layout/Header';
import { COLORS, SIZES, FONTS } from '@/constants/theme';
import { GlobalStyleSheet } from '@/constants/StyleSheet';
import { IMAGES } from '@/constants/Images';
import { Feather } from '@expo/vector-icons';
import Cardstyle2 from '@/components/Card/Cardstyle2';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigation/RootStackParamList';
import { getOrder, OrderItem } from '@/api/orderApi';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import ErrorComponent from '../Components/ErrorComponent';

type MyorderScreenProps = StackScreenProps<RootStackParamList, 'Myorder'>;

const Myorder = ({ navigation }: MyorderScreenProps) => {
    const theme = useTheme();
    const { colors }: { colors: any } = theme;
    const { t } = useTranslation();

    const [activeFilter, setActiveFilter] = useState('all');
    const [orders, setOrders] = useState<OrderItem[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    
    // Use a single status state instead of multiple booleans (loading, isFetchingMore)
    const [status, setStatus] = useState<'idle' | 'loading' | 'loadingMore' | 'succeeded' | 'failed'>('idle');
    const [error, setError] = useState<string | null>(null);

    const user = useSelector((state: RootState) => state.auth.user);
    
    // Use a ref to hold the AbortController to persist it across renders
    const abortControllerRef = useRef<AbortController | null>(null);

    // This effect handles the back navigation behavior. It's a specific UX choice.
 useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
        // Prevent the default action (e.g., going back)
        e.preventDefault();

        // **CRITICAL:** Remove the listener to prevent an infinite loop.
        unsubscribe();

        // Now, dispatch your custom navigation action.
        // This will no longer trigger the listener.
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'DrawerNavigation', params: { screen: 'Home' } }],
            })
        );
    });

    // The cleanup function returned by useEffect will also handle
    // unsubscribing if the component unmounts for other reasons.
    return unsubscribe;
}, [navigation]);

    // Centralized function for fetching orders
    const fetchOrders = useCallback(async (page: number, filter: string) => {
        // Abort any previous ongoing request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        
        // Create a new AbortController for the new request
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        setStatus(page === 1 ? 'loading' : 'loadingMore');
        setError(null);

        try {
            // Pass the signal to the API call
            
            const response = await getOrder(page, user.id, filter, { signal });

            setOrders((prevOrders) => page === 1 ? response.items : [...prevOrders, ...response.items]);
            setTotalCount(response.total_count);
            setStatus('succeeded');

        } catch (err: any) {
            // Ignore abort errors, as they are intentional
            if (err.name === 'AbortError') {
                return;
            }
            console.error('Error fetching orders:', err);
            setError(t("error_general"));
            setStatus('failed');
        }
    }, [user.id, t]); // Dependencies for the useCallback

    // Effect to fetch orders on initial load or when the filter changes
    useEffect(() => {
        // When filter changes, reset state and fetch page 1
        setCurrentPage(1);
        setOrders([]);
        fetchOrders(1, activeFilter);

        // Cleanup function to abort the request if the component unmounts
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [activeFilter, fetchOrders]);


    const handleLoadMore = () => {
        // Prevent fetching more if we are already loading or have all items
        if (status === 'loading' || status === 'loadingMore' || orders.length >= totalCount) {
            return;
        }
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        fetchOrders(nextPage, activeFilter);
    };

    const handleFilterPress = (key: string) => () => {
        if (key !== activeFilter) {
            setActiveFilter(key);
        }
    };

    const handleRetry = () => {
        // Retry fetching the first page for the current active filter
        fetchOrders(1, activeFilter);
    };

    // Memoize the filter data array as it depends on `t` but otherwise doesn't change
    const filterButtons = useMemo(() => [
        { key: 'all', label: t('all'), icon: null },
        { key: 'processing', label: t('ongoing'), icon: IMAGES.deliverytruck2 },
        { key: 'complete', label: t('completed'), icon: IMAGES.savecheck },
        { key: 'canceled', label: t('cancelled'), icon: IMAGES.delete },
        { key: 'pending', label: t('pending'), icon: IMAGES.clock },
        { key: 'pending_payment', label: t('pending_payment'), icon: IMAGES.clock },
        { key: 'clictopay_processed', label: t('clictopay_processed'), icon: IMAGES.check4 },
        { key: 'closed', label: t('closed'), icon: IMAGES.lock },
    ], [t]);


    const renderFilterItem = ({ item }: { item: typeof filterButtons[0] }) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <TouchableOpacity
                onPress={handleFilterPress(item.key)}
                style={{ flexDirection: 'row', alignItems: 'center', width: item.key === 'all' ? 50 : ['pending_payment', 'clictopay_processed'].includes(item.key) ? 160 : 120, justifyContent: 'center' }}
                activeOpacity={0.5}
            >
                {item.icon && (
                    <Image
                        style={{ height: 16, width: 16, resizeMode: 'contain', tintColor: activeFilter === item.key ? (theme.dark ? 'cyan' : COLORS.primary) : (theme.dark ? COLORS.light : colors.title), marginRight: 5 }}
                        source={item.icon}
                    />
                )}
                <Text style={[FONTS.fontMedium, { fontSize: 15, color: activeFilter === item.key ? (theme.dark ? 'cyan' : COLORS.primary) : (theme.dark ? COLORS.light : colors.title) }]}>
                    {item.label}
                </Text>
            </TouchableOpacity>
            {item.key !== 'closed' && <View style={{ width: 1, height: 40, backgroundColor: COLORS.primaryLight }} />}
        </View>
    );

    const renderOrderItem = ({ item }: { item: OrderItem }) => (
        // No need for a key on the View, FlatList's keyExtractor handles it.
        <View style={{ marginBottom: 10 }}>
            <Cardstyle2
                data={item}
                includeImage={false}
                title={`${t("order")} #${item.increment_id}`}
                price={`${item.base_grand_total} ${item.base_currency_code}`}
                product_view={false}
                image={null}
                offer=""
                brand=""
                btntitle={t("track_order")}
                pending={item.status === "pending" || item.status === "pending_payment"}
                trackorder={item.status === "processing"}
                completed={item.status === "complete"}
                payment_complete={item.status === "clictopay_processed"}
                status={item.status}
                EditReview=""
                date={item.created_at.split(' ')[0]}
                onPress={() => navigation.navigate('Trackorder', { order: item })}
            />
        </View>
    );

    // Full-screen loading indicator for the initial fetch
    if (status === 'loading') {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={[styles.loadingText, { color: colors.text }]}>{t("loading_orders")}</Text>
            </View>
        );
    }
    
    // Full-screen error only if the initial fetch fails
    if (status === 'failed' && orders.length === 0) {
        return <ErrorComponent message={error || t('error_general')} onRetry={handleRetry} />;
    }

    return (
        <ErrorBoundary>
            <View style={{ backgroundColor: colors.background, flex: 1 }}>
                <Header title={t('your_order')} leftIcon='back' titleRight />

                <View style={{ height: 40 }}>
                    <FlatList
                        data={filterButtons}
                        renderItem={renderFilterItem}
                        keyExtractor={item => item.key}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={[styles.filterContainer, { backgroundColor: theme.dark ? 'rgba(255,255,255,.1)' : colors.card }]}
                    />
                </View>

                <FlatList
                    data={orders}
                    renderItem={renderOrderItem}
                    keyExtractor={(item) => item.increment_id}
                    contentContainerStyle={{ flexGrow: 1, padding: SIZES.padding }}
                    showsVerticalScrollIndicator={false}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListEmptyComponent={
                        status === 'succeeded' ? (
                            <View style={styles.emptyContainer}>
                                <View style={styles.emptyIconContainer}>
                                    <Feather color={COLORS.primary} size={24} name='shopping-cart' />
                                </View>
                                <Text style={{ ...FONTS.h5, color: colors.title, marginBottom: 8 }}>{t("no_orders")}</Text>
                                <Text style={{ ...FONTS.fontSm, color: colors.text, textAlign: 'center', paddingHorizontal: 40 }}>{t("make_orders")}</Text>
                            </View>
                        ) : null
                    }
                    ListFooterComponent={() => {
                        if (status === 'loadingMore') {
                            return <ActivityIndicator style={{ marginVertical: 20 }} size="large" color={COLORS.primary} />;
                        }
                        // Optionally, show a small error if "load more" fails
                        if (status === 'failed' && orders.length > 0) {
                            return <Text style={{ textAlign: 'center', color: 'red', marginVertical: 10 }}>{error}</Text>;
                        }
                        return null;
                    }}
                />
            </View>
        </ErrorBoundary>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        ...FONTS.h6,
        marginTop: 10,
    },
    filterContainer: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
        height: 40,
        width: '100%',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    emptyIconContainer: {
        height: 60,
        width: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primaryLight,
        marginBottom: 20,
    },
});

export default Myorder;