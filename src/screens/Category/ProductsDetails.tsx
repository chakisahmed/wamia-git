import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, Share, SectionList, Platform, ToastAndroid, Modal, ActivityIndicator } from 'react-native'
import { Image } from 'expo-image';
import Header from '@/layout/Header';
import { IMAGES } from '@/constants/Images';
import { GlobalStyleSheet } from '@/constants/StyleSheet';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import Swiper from 'react-native-swiper';
import { Feather } from '@expo/vector-icons';
import Button from '@/components/Button/Button';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigation/RootStackParamList';
import { ScrollView } from 'react-native-gesture-handler';
import Cardstyle1 from '@/components/Card/Cardstyle1';
import { useDispatch, useSelector } from 'react-redux';
import { addItemToCart } from '@/redux/slices/cartSlice';
import { addProductToWishlist, removeProductFromWishlist } from '@/redux/slices/wishListSlice';
import { useNavigation, useRoute, useTheme } from '@react-navigation/native';
import { getProduct, getProductRest, getProducts, getProductsAttributeSet, Product } from '@/api/productsApi';
import { CartResponse, getCart } from '@/api/cartApi';
import RenderHTML from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import AddToCartModal from '@/components/Modal/AddToCartModal';
import { getCustomerDetails } from '@/api/customerApi';
import LikeBtn from '@/components/LikeBtn';
import { opacity } from 'react-native-reanimated/lib/typescript/Colors';
import { RootState } from '@/redux/store';
import SnackBar from './Snackbar';
import { useUpdateRecentlyViewed } from '@/hooks/useUpdateRecentlyViewed';
import ErrorComponent from '../Components/ErrorComponent';










type ProductsDetailsScreenProps = StackScreenProps<RootStackParamList, 'ProductsDetails'>;

const ProductsDetails = ({ navigation }: ProductsDetailsScreenProps) => {
    const dispatch = useDispatch();
    const token = useSelector((state: RootState) => state.auth.userToken);
    const { t } = useTranslation();
    const fullDetails = useSelector((state: RootState) => state.cart.details);
    const wishList = useSelector((state: any) => state.wishList.wishList);
    const inWishlist = () => {
        var temp = [] as any;
        wishList.forEach((data: any) => {
            temp.push(data.product.sku);
        });
        return temp;
    }
    const removeItemFromWishList = () => {
        // look for the item in the wishlist

        try {
            wishList.forEach((data: any) => {
                if (data.product.sku === product.sku) {
                    dispatch(removeProductFromWishlist(data.id));
                }
            });


        } catch (error) {

        }
    }

    const offerData = [
        {
            image: IMAGES.deliverytruck,
            title: t("free_shipping"),
            text: t("for_all_orders_over"),
        },
        {
            image: IMAGES.check3,
            title: t("secure_payment"),
            text: t("we_ensure_secure_payment"),
        },
        {
            image: IMAGES.savemoney,
            title: t("money_back_guarantee"),
            text: t("any_back_within_30_days"),
        },
        {
            image: IMAGES.technicalsupport,
            title: t("customer_support"),
            text: t("call_or_email_us"),
        },
        {
            image: IMAGES.wallet2,
            title: t("flexible_payment"),
            text: t("pay_with_multiple_credit_card"),
        },
    ]

    const ListwithiconData = [
        {
            title: t('general'),
            data: [
                "dimensions", 'condition', 'mode_expedition'
            ],
        },


    ];
    // const navagation = useNavigation();

    const [Select, setSelect] = useState(offerData[0]);
    const route = useRoute();
    const { product } = route.params as { product: Product };
    const theme = useTheme();
    const { colors }: { colors: any } = theme;
    const [productFullDetails, setProductFullDetails] = useState<Product | null>(null);
    const [selectedVariant, setSelectedVariant] = useState<Product | null>(null);
    const [selectedOptions, setSelectedOptions] = useState<any>({});
    const cart = useSelector((state:RootState)=>state.cart.cart)
    const [productAttributes, setProductAttributes] = useState<any>([]);
    const [productRest, setProductRest] = useState<any>();
    const [attributeSet, setAttributeSet] = useState<any>([]);
    const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
    const { width } = useWindowDimensions();
    const [discount, setDiscount] = useState<number>(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [inStock, setInStock] = useState<boolean>(false);
    const [selectedVariantName, setSelectedVariantName] = useState<string>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [retryFetch, setRetryFetch] = useState(0);



    const [currentPhotos, setCurrentPhotos] = useState<any>([]);





    const findAtt: any = (attCode: string) => {
        return productAttributes?.find((attr: any) => attr.attribute_code === attCode)?.option
            ?? productAttributes?.find((attr: any) => attr.attribute_code === attCode)?.value;
    }
    // useffect, add product sku to asyncstorage of recently viewed products, knowing that each sku is seperated by , 
    useUpdateRecentlyViewed(product?.sku);
    useWindowDimensions();

    useEffect(() => {

        // Use a ref to track if the component is still mounted.
        // This is safer than an AbortController if you can't pass the signal
        // down to your API functions (e.g., getProductRest).
        const isMounted = { current: true };

        const fetchAllProductData = async () => {
            // Reset state on each fetch attempt (important for retry)
            setLoading(true);
            setError(null);

            try {
                // Fetch all data in parallel where possible for speed
                const [restDetails, fullProductDetails] = await Promise.all([
                    getProductRest(product.sku),
                    getProduct(product.sku),
                ]);

                // Check if component is still mounted before setting state
                if (!isMounted.current) return;

                // --- Process Rest Details & Fetch Dependent Data ---
                setProductRest(restDetails);
                const attributeSetData = await getProductsAttributeSet(restDetails.attribute_set_id);
                if (!isMounted.current) return;

                // You can map attributes here as before
                const mappedAttributes = restDetails.custom_attributes.map((attr: any) => {
                    const attribute = attributeSetData.find((item: any) => item.attribute_code === attr.attribute_code);
                    if (attribute) {
                        return {
                            ...attr,
                            label: attribute.frontend_labels?.[0]?.label || attribute.default_frontend_label,
                            option: attribute.options.find((option: any) => option.value === attr.value)?.label
                        };
                    }
                    return attr;
                });
                setProductAttributes(mappedAttributes);
                setAttributeSet(attributeSetData);

                // --- Process Full Product Details ---
                setProductFullDetails(fullProductDetails);
                if (fullProductDetails.configurable_options != null) {
                    const selectedOptions = {} as any;
                    fullProductDetails.configurable_options.forEach(option => {
                        // find first non null variant
                        const variant = fullProductDetails.variants?.find(variant => variant.product[option.attribute_code] != null);

                        if (variant) {
                            option.values.forEach(value => {
                                if (value.value_index == (variant.product as any)[option.attribute_code]) {
                                    selectedOptions[option.attribute_code] = value.label;
                                }
                            });

                            // const foundOption = option.values.find(value => value.value_index === (variant.product as any)[option.attribute_code]);
                            //selectedOptions[option.attribute_code] = option.values.find(value => value.value_index === variant.product[option.attribute_code])?.label;

                        }
                    });
                    setSelectedOptions(selectedOptions);
                }

                // --- Fetch Similar Products (depends on restDetails) ---
                const similarSkus = restDetails.product_links?.map((p: any) => p.linked_product_sku) || [];
                if (similarSkus.length > 0) {
                    const similarProductsData = await getProducts('', 1, '', `sku:{in:["${similarSkus.join('","')}"]}`);
                    if (isMounted.current) {
                        setSimilarProducts(similarProductsData.items);
                    }
                }
                setCurrentPhotos(product.media_gallery)

            } catch (e: any) {
                console.error("Failed to fetch product details:", e);
                if (isMounted.current) {
                    // Set a user-friendly error message
                    setError(__DEV__ ? e.message : t('error_general'));
                }
            } finally {
                // Ensure loading is always set to false, even on error
                if (isMounted.current) {
                    setLoading(false);
                }
            }
        };

        fetchAllProductData();

        // The cleanup function that runs when the component unmounts
        return () => {
            isMounted.current = false;
        };
        // Dependency array: re-run if the product SKU or the retry trigger changes.
    }, [product.sku, retryFetch]);

    
    useEffect(() => {
        const isMounted = { current: true };
        try {
            if (Object.keys(selectedOptions).length === productFullDetails?.configurable_options?.length) {
            const variant = productFullDetails.variants?.find(variant => {
                return Object.keys(selectedOptions).every(key =>
                    variant.product.sku.includes(selectedOptions[key])
                );
            });

            if (isMounted.current)setSelectedVariant(variant);
            //if (variant) setCurrentPhotos(variant?.product.media_gallery);
            const discount = selectedVariant != null ? calculateDiscount(selectedVariant.product.price_range.maximum_price.regular_price.value, selectedVariant.product.price_range.maximum_price.final_price.value) :
                calculateDiscount(product.price_range.maximum_price.regular_price.value, product.price_range.maximum_price.final_price.value);
            if (isMounted.current)setDiscount(discount);
        }
        } catch (error) {
            if (isMounted.current) {
                    // Set a user-friendly error message
                    setError(__DEV__ ? e.message : t('error_fetching_product'));
                }
        }
        // Check if all options are selected
        return () => {
            isMounted.current = false;
        };
        
    }, [selectedOptions, productFullDetails]);
    const onShare = async () => {
        const url = "https://www.wamia.tn/" + findAtt('url_key') + ".html";
        try {
            const result = await Share.share({
                message:
                    url,
            });
            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                } else {
                    // shared
                }
            } else if (result.action === Share.dismissedAction) {
                // dismissed
            }
        } catch (error: any) {
            //alert(error.message);
        }
    };


    const handleAddToCart = async (buy: boolean) => {
        try {
            //setModalVisible(true);    



            const cartItem = {
                sku: product.sku,
                qty: 1,
                product_option: {
                    extension_attributes: {
                        configurable_item_options: Object.keys(selectedOptions).map(key => {
                            const option = productFullDetails?.configurable_options?.find(option => option.attribute_code === key);
                            const value = option?.values?.find(value => value.label === selectedOptions[key]);
                            return {
                                option_id: option?.attribute_id,
                                option_value: value?.value_index
                            };
                        })
                    }
                }
            };
            //check if all options are selected
            if (productFullDetails?.configurable_options != null && Object.keys(selectedOptions).length !== productFullDetails?.configurable_options?.length) {
                //setModalVisible(false);
                alert('Please select all options');
                return;
            }

            dispatch(addItemToCart({
                qty: 1,
                cartItem, image: product.media_gallery[0].url,
                name: product.name,
                price: selectedVariant != null ? selectedVariant.product.price_range.maximum_price.final_price.value : product.price_range.maximum_price.final_price.value,

                sku: selectedVariant != null ? selectedVariant.product.sku : product.sku,
                token
            } as any));

            // setModalVisible(false);  
            if (buy) {
                try {
                    const customer = await getCustomerDetails();
                    if (customer) {
                        navigation.navigate('DeliveryAddress', { cart: fullDetails });
                    } else {
                        //ToastAndroid.show(t("session_expired_or_invalid"), ToastAndroid.SHORT);
                        navigation.navigate('SignIn', { redirectTo: 'DeliveryAddress' });
                    }
                } catch (error) {
                    
                }
            }
            else showSnackBar();

        } catch (error) {
            ToastAndroid.show(error.response.data.message, ToastAndroid.SHORT);

        }
    };
    const checkVariants = () => {
        if (productFullDetails?.configurable_options == null) {
            return true;
        }
        for (const option of productFullDetails.configurable_options) {

            for (const value of option.values) {
                //     productFullDetails.variants?.map(variant => variant.product.couleur),
                //     productFullDetails.variants?.map(variant => variant.product.motif)

                // );
                const variant = productFullDetails.variants?.find(variant => variant.product.couleur === value.value_index.toString() || variant.product.motif === value.value_index);
                if (variant != null) {
                    return true;
                }
            }
        }
        return false;
    };
    const handleRetry = () => {
        setRetryFetch(prev => prev + 1); // Increment to trigger the useEffect
    };
    useEffect(() => {
        const inStock = checkVariants();
        setInStock(inStock)
    }, [productFullDetails])

    const addItemToWishList = () => {

        dispatch(addProductToWishlist(product.sku));
    }
    const calculateDiscount = (price: number, finalPrice: number) => {
        if (finalPrice < price) {
            return Math.round(((price - finalPrice) / price) * 100);
        }
        return 0;
    };

    const [snackVisible, setSnackVisible] = useState(false);

    const showSnackBar = () => {
        setSnackVisible(true);

        // Automatically hide after 3 seconds (optional)
        setTimeout(() => {
            setSnackVisible(false);
        }, 5000);

    };

    const handleContinueShopping = () => {
        setSnackVisible(false);
        navigation.goBack();
    };

    const handleViewCart = () => {
        setSnackVisible(false);
        navigation.navigate('MyCart')
    };

    return (
        <>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
            >
                <View style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 1,
                    position: 'relative',
                }}>
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => {

                        }}
                        style={{

                            position: 'absolute',
                            height: '100%',
                            width: '100%',
                            backgroundColor: 'rgba(0,0,0,.3)',
                        }}
                    />
                    <AddToCartModal />



                </View>
            </Modal>
            <View style={{ backgroundColor: colors.background, flex: 1 }}>
                <Header
                    title={t('product_details')}
                    leftIcon='back'
                    rightIcon2={'cart'}
                    rightIcon1={'search'}
                    data={cart}
                />
                {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : error ? (
                <ErrorComponent message={error} onRetry={handleRetry} />
            ) :
                
                
                (<>


                    <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
                        <View
                            style={[GlobalStyleSheet.container, {
                                width: '100%',
                                height: 400,
                                paddingTop: 40,
                                backgroundColor: theme.dark ? 'rgba(255,255,255,.1)' : colors.card,
                                paddingBottom: 30,
                                padding: 0
                            }]}
                        >
                            {currentPhotos && (<Swiper
                                showsPagination={true}
                                index={0}

                                loop={false}
                                paginationStyle={{
                                    bottom: -20,
                                }}
                                dotStyle={{
                                    height: 8,
                                    width: 8,
                                    backgroundColor: COLORS.primary,
                                    opacity: .2
                                }}
                                activeDotStyle={{
                                    height: 8,
                                    width: 8,
                                    backgroundColor: COLORS.primary,
                                }}
                            >
                                {currentPhotos.map((data: any, index: number) => (
                                    <View
                                        key={index}
                                    >
                                        <Image
                                            style={{
                                                height: 350,
                                                width: '100%',
                                                marginBottom: 50
                                            }}
                                            contentFit='contain'
                                            source={{ uri: data.url }}
                                        />
                                    </View>
                                )
                                )}
                            </Swiper>)}
                            <View
                                style={{
                                    position: 'absolute',
                                    left: 0,
                                    right: 0,
                                    top: 0,
                                    paddingHorizontal: 0,
                                    paddingLeft: 10,
                                    paddingVertical: 10,
                                    flexDirection: 'row',
                                    //alignItems:'center',
                                    justifyContent: 'space-between'
                                }}
                            >
                                {discount > 0 && <View style={{}}>
                                    <View
                                        style={{
                                            marginTop: 10,
                                            backgroundColor: COLORS.success,
                                            paddingHorizontal: 5,
                                            paddingVertical: 2
                                        }}
                                    >
                                        <Text style={[FONTS.fontSemiBold, { fontSize: 12, color: COLORS.card }]}>{discount}% {t('off')}</Text>
                                    </View>
                                </View>}
                                <View>
                                    <TouchableOpacity
                                        style={{
                                            height: 38,
                                            width: 38,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: 8,
                                        }}
                                        onPress={onShare}
                                    >
                                        <Feather size={22} color={colors.text} name={'share-2'} />
                                        {/* <FeatherIcon size={20} color={COLORS.white} name="share-2" /> */}
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{ position: 'absolute', left: discount > 0 ? -40 : 30, top: -5 }}>
                                        <LikeBtn
                                            sku={product.sku}
                                            onPress={inWishlist().includes(product.sku) ? removeItemFromWishList : addItemToWishList}
                                            inWishlist={inWishlist}
                                            size={24}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                        {discount > 0 && <View style={[GlobalStyleSheet.container, { padding: 0 }]}>
                            <View style={{ height: 45, backgroundColor: '#87E8FF', marginVertical: 10, flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'space-between', paddingLeft: 15 }}>
                                <View>
                                    <Text style={[FONTS.fontRegular, { fontSize: 15, color: COLORS.title }]}>{t('you_are_saving')} <Text style={[FONTS.fontSemiBold, { color: '#07A3C5' }]}>
                                        {(selectedVariant != null ? selectedVariant.product.price_range.maximum_price.regular_price.value - selectedVariant.product.price_range.maximum_price.final_price.value
                                            : product.price_range.maximum_price.regular_price.value - product.price_range.maximum_price.final_price.value).toFixed(3)} {selectedVariant != null ? selectedVariant.product.price_range.maximum_price.final_price.currency
                                                : product.price_range.maximum_price.final_price.currency}
                                    </Text> {t('on_this_item')}</Text>
                                </View>
                                <View>
                                    <Image
                                        style={{ height: 45, resizeMode: 'contain', marginRight: Platform.OS === 'android' ? -35 : 0 }}
                                        source={IMAGES.background}
                                    />
                                    <Image
                                        style={{ position: 'absolute', height: 28, width: 28, top: 10, right: 15 }}
                                        source={IMAGES.gift}
                                    />
                                </View>
                            </View>
                        </View>}
                        <View style={[GlobalStyleSheet.container, { backgroundColor: theme.dark ? 'rgba(255,255,255,.1)' : colors.card }]}>
                            <Text style={[FONTS.fontMedium, { fontSize: 18, color: colors.title, }]}>{selectedVariantName ?? product.name}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 }}>


                                {[...Array(5)].map((_, index) => (
                                    <Image
                                        key={index}
                                        style={{ height: 12, width: 12 }}
                                        source={index < Math.round(product.rating_summary) ? IMAGES.star5 : IMAGES.star6}
                                    />
                                ))}
                                <Text style={[FONTS.fontRegular, { fontSize: 12, color: colors.title, opacity: .5 }]}>({product.review_count > 0 ? product.review_count + ` ${t('reviews')}` : t('no_reviews')})</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 5 }}>
                                {/**
                         * {discount > 0 ? (
        <View style={styles.prices}>
          <Text style={styles.originalPrice}>{item.price}</Text>
          <Text style={styles.finalPrice}>{item.final_price}</Text>
        </View>
        ) : (
        <Text style={styles.productPrice}>{item.final_price}</Text>
        )}
                         */}
                                {discount > 0 ? (<View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                    <Text style={[FONTS.fontSemiBold, { fontSize: 20, color: COLORS.success }]}>
                                        {selectedVariant != null ? selectedVariant.product.price_range.maximum_price.final_price.value
                                            : product.price_range.maximum_price.final_price.value} {selectedVariant != null ? selectedVariant.product.price_range.maximum_price.final_price.currency : product.price_range.maximum_price.final_price.currency}
                                    </Text>
                                    <Text style={[FONTS.fontMedium, { fontSize: 20, color: colors.title, textDecorationLine: 'line-through', opacity: .6 }]}>{product.price_range.maximum_price.regular_price.value} {product.price_range.maximum_price.final_price.currency}</Text>
                                </View>
                                ) : (
                                    <>
                                        <Text style={[FONTS.fontSemiBold, { fontSize: 20, color: COLORS.success }]}>{selectedVariant != null ? selectedVariant.product.price_range.maximum_price.final_price.value
                                            : product.price_range.maximum_price.final_price.value} {product.price_range.maximum_price.final_price.currency}</Text>
                                        <Text style={[FONTS.fontMedium, { fontSize: 14, color: COLORS.danger }]}>  {discount}% {t('off')}</Text>
                                    </>
                                )
                                }
                                <Text style={[FONTS.fontMedium, { fontSize: 15, color: inStock ? COLORS.success : COLORS.danger, }]}>{inStock ? t('in_stock') : t('out_of_stock')}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10 }}>
                                <Image
                                    style={{ height: 14, width: 14 }}
                                    source={IMAGES.leftarrow}
                                />
                                <Text style={[FONTS.fontRegular, { fontSize: 15, color: colors.text }]}>{t('return_policy')} {productAttributes?.find((attr: any) => attr.attribute_code === 'politique_de_retour')?.option}</Text>
                                <Text style={[FONTS.fontSemiBold, { fontSize: 15, color: COLORS.success }]}>{productAttributes?.find((attr: any) => attr.attribute_code === 'Livraison_gratuite')?.option == 'Oui' && t('free_shipping')}</Text>
                            </View>
                        </View>
                        {productFullDetails?.configurable_options?.length > 0 ? <View style={[GlobalStyleSheet.container, { backgroundColor: theme.dark ? 'rgba(255,255,255,.1)' : colors.card, marginVertical: 10, paddingBottom: 0, paddingTop: 10 }]}>
                            <Text style={[FONTS.fontMedium, { fontSize: 16, color: colors.title, paddingBottom: 10 }]}>{t('select_variant')}</Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -15 }}>
                                {productFullDetails?.configurable_options?.map((data, index) => {
                                    return (
                                        <TouchableOpacity key={index}
                                            style={{
                                                paddingVertical: 10,
                                                width: '100%',
                                                borderTopWidth: 1,
                                                borderTopColor: COLORS.primaryLight,
                                                paddingHorizontal: 15,
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'space-between'
                                            }}
                                        >
                                            <Text style={[FONTS.fontMedium, { fontSize: 15, color: colors.title }]}>{data.label}</Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 10 }}>

                                                    {data.values?.map((value, index) => {



                                                        const variant = productFullDetails.variants?.find(variant =>

                                                            variant.product[data.attribute_code] === value.value_index.toString()
                                                            || variant.product[data.attribute_code] === value.value_index
                                                        );

                                                        const isSelected = selectedOptions[data.attribute_code] === value.label;

                                                        function imageAttribute(attribute_code: string) {
                                                            return ['couleur', 'motif'].includes(attribute_code);
                                                        }

                                                        return (variant ?
                                                            <TouchableOpacity
                                                                key={index}
                                                                style={{
                                                                    padding: 5,
                                                                    //backgroundColor: isSelected ? COLORS.primary : (theme.dark ? 'rgba(255,255,255,.1)' : colors.card),
                                                                    borderRadius: 4,
                                                                    flexDirection: 'row',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    marginRight: 5,
                                                                }}
                                                                onPress={() => {
                                                                    setSelectedOptions({ ...selectedOptions, [data.attribute_code]: value.label });
                                                                    setSelectedVariantName(variant.product.name);
                                                                    setCurrentPhotos(variant.product.media_gallery);
                                                                    // print selected variant product name
                                                                }}
                                                            >
                                                                <View style={{ alignContent: 'center' }}>
                                                                    {(imageAttribute(data.attribute_code) && variant?.product.media_gallery?.[0]?.url) ? (
                                                                        <Image
                                                                            style={{
                                                                                height: 50, width: 50, marginRight: 5, borderWidth: isSelected ? 2 : 0,
                                                                                borderColor: isSelected ? COLORS.secondary : 'transparent'
                                                                            }} // Adjust the size as needed
                                                                            source={{ uri: variant.product?.media_gallery[0].url }}
                                                                        />


                                                                    )
                                                                        :
                                                                        (<Text style={[FONTS.fontRegular, { fontSize: 18, color: isSelected ? COLORS.secondary : colors.title }]}>{value.label}</Text>)}
                                                                    {/* <Text style={[FONTS.fontRegular, { fontSize: 14, color: isSelected ? COLORS.secondary : colors.title }]}>{value.label.length > 6 ? `${value.label.substring(0, 6)}...` : value.label}</Text> */}
                                                                </View>


                                                            </TouchableOpacity>
                                                            : null)
                                                    })}</ScrollView>
                                            </View>
                                        </TouchableOpacity>
                                    )
                                })}
                            </View>
                        </View> : <View style={{ height: 10 }}></View>}
                        <View style={[GlobalStyleSheet.container, { paddingHorizontal: -15, paddingVertical: 0, marginBottom: 10 }]}>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ paddingHorizontal: 15 }}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                                    {offerData.map((data: any, index) => {
                                        return (
                                            <TouchableOpacity
                                                key={index}
                                                style={[{
                                                    padding: 10,
                                                    backgroundColor: theme.dark ? 'rgba(255,255,255,.1)' : colors.card,
                                                    borderRadius: 4
                                                }, Select === data && {
                                                    backgroundColor: COLORS.primary
                                                }]}
                                                onPress={() => setSelect(data)}
                                            >
                                                <View style={{ alignItems: 'center' }}>
                                                    <Image
                                                        style={{ height: 45, width: 45, tintColor: Select === data ? COLORS.secondary : COLORS.primary }}
                                                        source={data.image}
                                                    />
                                                    <View>
                                                        <Text style={[FONTS.fontMedium, { fontSize: 15, color: Select === data ? COLORS.white : colors.title, textAlign: 'center' }]}>{data.title}</Text>
                                                        <Text style={[FONTS.fontRegular, { fontSize: 12, color: Select === data ? COLORS.white : colors.title, opacity: .7, textAlign: 'center' }]}>{data.text}</Text>
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                        )
                                    })}
                                </View>
                            </ScrollView>
                        </View>
                        <View style={[GlobalStyleSheet.container, { backgroundColor: theme.dark ? 'rgba(255,255,255,.1)' : colors.card, marginBottom: 10 }]}>
                            <View style={{}}>
                                <Text style={[FONTS.fontMedium, { fontSize: 16, color: theme.dark ? COLORS.light : colors.title }]}>{t('short_description')}:</Text>

                                <RenderHTML
                                    source={{ html: productAttributes?.find((attr: any) => attr.attribute_code === 'short_description')?.value || '' }}
                                    defaultTextProps={{
                                        style: [{ color: theme.dark ? COLORS.light : colors.title }, FONTS.fontRegular], // Apply the custom font style
                                    }}
                                    contentWidth={width}

                                />
                            </View>
                        </View>
                        <View style={[GlobalStyleSheet.container, { backgroundColor: theme.dark ? 'rgba(255,255,255,.1)' : colors.card }]}>
                            <View style={{}}>
                                <Text style={[FONTS.fontMedium, { fontSize: 16, color: colors.title }]}>{t('description')}:</Text>

                                <RenderHTML
                                    source={{ html: productAttributes?.find((attr: any) => attr.attribute_code === 'description')?.value || '' }}
                                    defaultTextProps={{
                                        style: [{ color: theme.dark ? COLORS.light : colors.title }, FONTS.fontRegular], // Apply the custom font style
                                    }}
                                />
                            </View>
                        </View>

                        <View style={[GlobalStyleSheet.container, { backgroundColor: theme.dark ? 'rgba(255,255,255,.1)' : colors.card, marginTop: 10, marginBottom: 10 }]}>
                            <Text style={[FONTS.fontMedium, { fontSize: 16, color: colors.title }]}>{t('more_informations')}</Text>
                        </View>
                        <View style={[GlobalStyleSheet.container, { flex: 1, paddingTop: 0 }]}>
                            <View style={{ marginHorizontal: -15, marginTop: 0, flex: 1 }}>
                                <SectionList
                                    contentContainerStyle={{ backgroundColor: colors.card, marginTop: -10 }}
                                    scrollEnabled={false}
                                    sections={ListwithiconData}
                                    keyExtractor={(item: any, index) => item + index}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            activeOpacity={0.9}
                                            //onPress={() => navigation.navigate(item.navigate)}
                                            style={{
                                                flexDirection: 'row',
                                                paddingHorizontal: 15,
                                                // height: 30,
                                                alignItems: 'center',
                                                paddingVertical: 5,
                                                //borderRadius: SIZES.radius,
                                                backgroundColor: 'colors.card',
                                                //marginVertical:5
                                            }}
                                        >
                                            <View style={{ width: '40%' }}>
                                                <Text style={{ ...FONTS.fontMedium, fontSize: 14, color: colors.text, }}>
                                                    {item == "dimensions" ? t("dimensions") :
                                                        productAttributes?.find((attr: any) => attr.attribute_code === item)?.label || ''}

                                                </Text>
                                            </View>
                                            <View>
                                                <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: colors.title }}>
                                                    {item == "dimensions" ? findAtt('longueur25') + "x" + findAtt('dimensions_de_l_outil_largeur1') + "x" + findAtt('dimensions_de_l_outil_hauteur1') + " cm" :
                                                        productAttributes?.find((attr: any) => attr.attribute_code === item)?.option || ''}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    )}
                                    renderSectionHeader={({ section: { title } }) => (
                                        <Text
                                            style={{
                                                ...FONTS.fontRegular,
                                                fontSize: 13,
                                                color: theme.dark ? COLORS.light : COLORS.title,
                                                paddingLeft: 15,
                                                paddingVertical: 5,
                                                backgroundColor: theme.dark ? COLORS.primary : COLORS.primaryLight,
                                                //borderBottomWidth:1,
                                                //borderBottomColor:COLORS.primaryLight,
                                                marginTop: 10,
                                                marginBottom: 10
                                            }}
                                        >{title}</Text>
                                    )}
                                />
                            </View>
                        </View>
                        <View style={[GlobalStyleSheet.container, { paddingHorizontal: 15, backgroundColor: theme.dark ? 'rgba(255,255,255,.1)' : colors.card, borderBottomWidth: 1, borderBottomColor: COLORS.primaryLight, paddingVertical: 15, marginTop: -5 }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text style={[FONTS.fontMedium, { fontSize: 18, color: colors.title }]}>{t('similar_products')}</Text>
                            </View>
                        </View>
                        <View style={[GlobalStyleSheet.container, { padding: 0, borderBottomWidth: 1, borderBlockColor: COLORS.primaryLight }]}>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                    {similarProducts?.map((item: any, index: any) => {
                                        return (
                                            <View style={[{ marginBottom: 0, width: SIZES.width > SIZES.container ? SIZES.container / 3 : SIZES.width / 2.3 }]} key={index}>
                                                <Cardstyle1
                                                    id={item.id}
                                                    data={item}
                                                    sku={item.sku}
                                                    title={item.name}
                                                    image={item.media_gallery[0].url}
                                                    discount={discount > 0 ? item.price_range.maximum_price.final_price.value.toString() + " " + item.price_range.maximum_price.final_price.currency : ''}
                                                    offer={discount > 0 ? discount.toString() + '% OFF' : ''}
                                                    price={item.price_range.maximum_price.regular_price.value.toString() + " " + item.price_range.maximum_price.final_price.currency}
                                                    btntitle='Add to Cart'

                                                    onPress={() => {

                                                        navigation.pop();
                                                        navigation.push('ProductsDetails', { product: item });

                                                    }}
                                                    onPress3={() => addItemToWishList(item)}

                                                />
                                            </View>
                                        )
                                    })}
                                </View>
                            </ScrollView>
                        </View>
                    </ScrollView>

                    <View style={[GlobalStyleSheet.container, { padding: 0, }]}>
                        <View
                            style={{
                                flexDirection: 'row',
                                width: '100%',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {inStock ?
                                <>

                                    <View style={{ width: '50%' }}>
                                        <TouchableOpacity
                                            onPress={() => { handleAddToCart(false); }}
                                            style={{
                                                backgroundColor: theme.dark ? COLORS.primary : COLORS.white,
                                                padding: 15,
                                                alignItems: 'center',
                                                borderRadius: 0
                                            }}
                                        >
                                            <Text style={{ color: theme.dark ? COLORS.white : COLORS.primary, ...FONTS.fontMedium }}>{t('add_to_cart')}</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{ width: '50%' }}>
                                        <TouchableOpacity
                                            onPress={() => { handleAddToCart(true); }}
                                            style={{
                                                backgroundColor: COLORS.secondary,
                                                padding: 15,
                                                alignItems: 'center',
                                                borderRadius: 0
                                            }}
                                        >
                                            <Text style={{ color: COLORS.title, ...FONTS.fontMedium }}>{t('buy_now')}</Text>
                                        </TouchableOpacity>
                                    </View>


                                </>
                                :
                                <View style={{ width: '100%', backgroundColor: 'white' }}>
                                    <Button

                                        title={t('out_of_stock')}
                                        color={theme.dark ? COLORS.primary : COLORS.white}
                                        text={COLORS.danger}
                                        style={{ borderRadius: 0, }}
                                    />
                                </View>
                            }
                            {/* <View style={{ width: '50%' }}>
                        <Button
                            title='Buy Now'
                            color={COLORS.secondary}
                            text={COLORS.title}
                            onPress={() => navigation.navigate('DeliveryAddress')}
                            style={{ borderRadius: 0 }}
                        />
                    </View> */}
                        </View>
                    </View></>)}
                <SnackBar
                    visible={snackVisible}
                    message={product.name}
                    onContinue={handleContinueShopping}
                    onViewCart={handleViewCart}
                />
            </View>
        </>
    )
}

export default ProductsDetails