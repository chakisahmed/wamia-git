import { useTheme } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, ToastAndroid, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import Header from '@/layout/Header';
import { GlobalStyleSheet } from '@/constants/StyleSheet';
import { COLORS, FONTS } from '@/constants/theme';
import Cardstyle2 from '@/components/Card/Cardstyle2';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigation/RootStackParamList';
import { useDispatch, useSelector } from 'react-redux';
import { removeItemFromCart, fetchCartItems, addItemToCart } from '@/redux/slices/cartSlice';
import { Feather } from '@expo/vector-icons';
import { getProduct, getProductRest, getProducts, Product } from '@/api/productsApi';
import { useTranslation } from 'react-i18next';
import PlaceholderCard from './PlaceholderCard';
import ProductsRowSection from '@/screens/Components/Home/ProductsRowSection';
import { addProductToWishlist } from '@/redux/slices/wishListSlice';


import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RootState } from '@/redux/store';
import LoadingComponent from '../Components/LoadingComponent';
type MyCartScreenProps = StackScreenProps<RootStackParamList, 'MyCart'>;

const MyCart = ({ navigation }: MyCartScreenProps) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { details, status, error } = useSelector((state: RootState) => state.cart);

    const cartItems = details?.items || [];
    const fullDetails = details; // Alias for readability if you use it a lot
    const token = useSelector((state: RootState) => state.auth.userToken)
    const [refreshing, setRefreshing] = useState(false);
    const [relatedCartProducts, setRelatedCartProducts] = useState<Product[]>([]);

    useEffect(() => {


        const controller = new AbortController()
        const signal = controller.signal
        const getRelatedProducts = async () => {
            if (!fullDetails || !fullDetails.items || fullDetails.items.length === 0) {
                setRelatedCartProducts([]); // Handle empty cart case
                return;
            }

            // 1. Use .map to create an array of promises. Each promise will resolve to a list of related SKUs.
            const promises = fullDetails.items.map(async (item) => {
                if (!item.sku) return;
                let prodDetails;
                if (item.product_type === "simple") {
                    prodDetails = await getProductRest(item.sku);
                } else if (item.product_type === "configurable") {
                    const parentSku = item.sku.split('-').slice(0, -1).join('-');
                    prodDetails = await getProductRest(parentSku);
                }

                // Return the array of linked product SKUs for this item
                return prodDetails?.product_links?.map((link) => link.linked_product_sku) || [];
            });

            // 2. Wait for ALL promises to resolve.
            // `allRelatedSkuArrays` will be an array of arrays, e.g., [['skuA', 'skuB'], ['skuC'], []]
            const allRelatedSkuArrays = await Promise.all(promises);

            // 3. Flatten the array of arrays and remove duplicates
            const uniqueRelatedSkus = [...new Set(allRelatedSkuArrays.flat())];


            if (uniqueRelatedSkus.length === 0) {
                setRelatedCartProducts([]); // No related products found
                return;
            }

            // 4. Now make the final API call with the complete list of SKUs
            const response = await getProducts('', 1, null, `sku:{in:["${uniqueRelatedSkus.join('","')}"]}`, 20, '');
            if (!signal.aborted) setRelatedCartProducts(response.items);
        };

        getRelatedProducts();


        return () => {
            controller.abort();
        };

    }, [fullDetails]);


    const addItemToWishList = useCallback((data) => {
        try {
            dispatch(addProductToWishlist(data.sku));
            //ToastAndroid.show(t("item_added_to_wishlist"), ToastAndroid.SHORT);
        } catch (error) {
            console.error('Error adding item to wishlist:', error);
        }
    }, [dispatch]);
    type CartRequest = {
        sku: string;
        qty: number;
        product_option?: any;
    };
    const addItemToCartHandler = useCallback((data) => {
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

    const handleRemoveItemFromCart = (itemId: number) => {
        // Dispatch the action with the required payload: { itemId, token }
        dispatch(removeItemFromCart({ itemId, token }));
    };

    const handleFetchCartItems = () => {
        dispatch(fetchCartItems());
    };

    const onRefresh = () => {
        setRefreshing(true);
        handleFetchCartItems();
        setRefreshing(false);
    };

    // Fetch cart items when the component mounts
    useEffect(() => {
        onRefresh();
    }, []);

    useEffect(()=>{
        if(status=="failed"){
            ToastAndroid.show(error ?? "",ToastAndroid.SHORT)

        }
    },[status])

    const theme = useTheme();
    const { colors }: { colors: any } = theme;


    const handlePress =
        async () => {
            try {

                if (token) {
                    navigation.navigate('DeliveryAddress');
                }
                else {
                    navigation.navigate('SignInPhone', { redirectTo: 'DeliveryAddress' });
                }
            } catch (error) {
                console.error('Error fetching customer details in cart:', error);


            }
        }
 
    if (status === 'loading' && cartItems.length === 0) {
        return (
            <>
                <Header title={t('shopping_cart')} leftIcon='back' titleLeft rightIcon2="trash" />
                <LoadingComponent />
            </>
        );
    } 

    // =================================================================
    // ADDED: Error State UI
    // We show this if the initial fetch fails.
    // =================================================================
    if (status === 'failed' && details==null) {
        return (
            <>
                <Header title={t('shopping_cart')} leftIcon='back' titleLeft rightIcon2="trash" />
                <View style={styles.centeredContainer}>
                    <Feather name="alert-circle" size={40} color={COLORS.danger} />
                    <Text style={[styles.statusText, { color: colors.text, fontWeight: 'bold' }]}>{t('error_loading_cart')}</Text>
                    <Text style={[styles.statusText, { color: colors.text, fontSize: 14 }]}>{error}</Text>
                    <Pressable onPress={handleFetchCartItems} style={styles.retryButton}>
                        <Text style={styles.retryButtonText}>{t('retry')}</Text>
                    </Pressable>
                </View>
            </>
        );
    }


    return (
        <ErrorBoundary>
            <View style={{ backgroundColor: colors.background, flex: 1 }}>
                <Header
                    title={t('shopping_cart')}
                    leftIcon='back'
                    titleLeft
                    righttitle2
                    rightIcon2="trash"
                    data={cartItems}
                />
                {cartItems.length > 0 ?
                    <View
                        style={[GlobalStyleSheet.container,
                        {
                            paddingHorizontal: 15,
                            backgroundColor: theme.dark ? 'rgba(255,255,258,.1)' : colors.card,
                            shadowColor: "#000",
                            shadowOffset: {
                                width: 0,
                                height: 4,
                            },
                            shadowOpacity: 0.35,
                            shadowRadius: 6.27,
                            elevation: 5,
                        }
                        ]}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                <View style={{ height: 18, width: 18, borderRadius: 30, backgroundColor: theme.dark ? 'orange' : COLORS.primary, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={[FONTS.fontMedium, { fontSize: 10, color: COLORS.card }]}>1</Text>
                                </View>
                                <Text style={[FONTS.fontMedium, { fontSize: 13, color: theme.dark ? 'orange' : colors.title }]}>{t('cart')}</Text>
                            </View>
                            <View style={{ height: 2, flex: 1, backgroundColor: colors.title, opacity: .1, marginHorizontal: 10 }} />
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                <View style={{ height: 18, width: 18, borderRadius: 30, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={[FONTS.fontMedium, { fontSize: 10, color: COLORS.title }]}>2</Text>
                                </View>
                                <Text style={[FONTS.fontMedium, { fontSize: 13, color: colors.text }]}>{t('address')}</Text>
                            </View>
                            <View style={{ height: 2, flex: 1, backgroundColor: colors.title, opacity: .1, marginHorizontal: 10 }} />
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                <View style={{ height: 18, width: 18, borderRadius: 30, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={[FONTS.fontMedium, { fontSize: 10, color: COLORS.title }]}>3</Text>
                                </View>
                                <Text style={[FONTS.fontMedium, { fontSize: 13, color: colors.text }]}>{t('payment')}</Text>
                            </View>
                        </View>
                    </View>
                    :
                    null
                }
                {/* {cart.length > 0 ?
                <View style={[GlobalStyleSheet.container, { padding: 0 }]}>
                    <View style={{ height: 45, backgroundColor: '#87E8FF', marginVertical: 15, flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'space-between', paddingLeft: 15 }}>
                        <View>
                            <Text style={[FONTS.fontRegular, { fontSize: 15, color: COLORS.title }]} >You're saving<Text style={[FONTS.fontSemiBold, { color: '#07A3C5' }]}> $5,565 </Text>on this time</Text>
                        </View>
                        <View>
                            <Image
                                style={{ height: 45, resizeMode: 'contain', marginRight: -35 }}
                                source={IMAGES.background}
                            />
                            <Image
                                style={{ position: 'absolute', height: 28, width: 28, top: 10, right: 15 }}
                                source={IMAGES.gift}
                            />
                        </View>
                    </View>  
                </View>
                :
                null
            } */}
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >

                    <View style={[GlobalStyleSheet.container, { padding: 0 }]}>
                        {cartItems.map((data) => {
                            const isAddingPlaceholder =
                                data.loading && data.item_id.toString().startsWith('temp-');
                            return (
                                <View key={data.item_id} style={{ marginBottom: 10 }}>
                                    {isAddingPlaceholder ? (
                                        <PlaceholderCard />
                                    ) : (
                                        <Cardstyle2
                                            data={data}
                                            image={data.image}
                                            qty={data.qty}
                                            onPress={async () => {
                                                try {
                                                    let product = await getProduct(data.sku);
                                                    if (!product) {
                                                        const configurableSku = data.sku.split('-').slice(0, -1).join('-') ?? data.sku;
                                                        product = await getProduct(configurableSku);
                                                    }
                                                    // split by - and remove the last part

                                                    if (product === undefined) {
                                                        throw new Error(t('product_not_found'));
                                                    }
                                                    navigation.navigate('ProductsDetails', { product });

                                                } catch (error) {
                                                    console.error('Error fetching product:', error);
                                                    ToastAndroid.show(t('product_not_found'), ToastAndroid.SHORT);
                                                }
                                            }}
                                            onPress4={() => handleRemoveItemFromCart(data.item_id)}
                                        />
                                    )}
                                </View>
                            );
                        })}
                    </View>
                    <ProductsRowSection title={t('check_out_other_similar_products')} products={relatedCartProducts} addItemToWishList={addItemToWishList} addItemToCart={addItemToCartHandler} />

                </ScrollView>
                {cartItems.length > 0 ?
                    (
                        <View style={[GlobalStyleSheet.container, { backgroundColor: theme.dark ? 'rgba(255,255,255,.1)' : colors.card }]}>
                            <Pressable
                                onPress={handlePress}
                                style={({ pressed }) => [

                                    styles.button,
                                    {
                                        flexDirection: 'row',

                                        backgroundColor: COLORS.secondary,
                                        opacity: pressed ? 0.7 : 1, // Visual feedback for pressed state
                                    },
                                ]}
                            >
                                {fullDetails && <View style={{ position: "absolute", left: 10 }}>

                                    <Text style={{}}>{`${fullDetails?.items_qty} ${t('items')}`}</Text>
                                    <Text style={{}}>{`${(fullDetails.items.reduce((a, b) => a + b.price * b.qty, 0)).toFixed(3)} ${fullDetails.currency?.base_currency_code}`}</Text>
                                </View>}

                                <Text style={[styles.buttonText, { color: COLORS.title }]}>
                                    {`${t('proceed_to_buy')}`}
                                </Text>

                                <Feather name='arrow-right' size={24} style={{ position: 'absolute', right: 10 }} />
                            </Pressable>
                        </View>
                    )
                    :
                    (
                        <View style={[GlobalStyleSheet.container, { padding: 0, position: 'absolute', left: 0, right: 0, bottom: 0, top: 20 }]}>
                            <View
                                style={{
                                    flex: 1,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <View
                                    style={{
                                        height: 60,
                                        width: 60,
                                        borderRadius: 60,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: COLORS.primaryLight,
                                        marginBottom: 20,
                                    }}
                                >
                                    <Feather color={COLORS.primary} size={24} name='shopping-cart' />
                                </View>
                                <Text style={{ ...FONTS.h5, color: colors.title, marginBottom: 8 }}>{t('your_shopping_cart_is_empty')}</Text>
                                <Text
                                    style={{
                                        ...FONTS.fontSm,
                                        color: colors.text,
                                        textAlign: 'center',
                                        paddingHorizontal: 40,
                                        //marginBottom:30,
                                    }}
                                >{t('add_product_to_favourite')}</Text>
                            </View>
                        </View>
                    )
                }
            </View></ErrorBoundary>
    );
};

export default MyCart;
const styles = StyleSheet.create({
    button: {
        paddingVertical: 20,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    // ADDED: New styles for status screens
    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    statusText: {
        marginTop: 15,
        fontSize: 16,
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 20,
        backgroundColor: COLORS.primary,
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 8,
    },
    retryButtonText: {
        color: COLORS.white,
        ...FONTS.fontSemiBold,
        fontSize: 16,
    },
    emptyCartIconContainer: {
        height: 60,
        width: 60,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primaryLight,
        marginBottom: 20,
    }
});