import { useTheme } from '@react-navigation/native';
import { View, ScrollView, Text } from 'react-native'
import Header from '@/layout/Header';
import { GlobalStyleSheet } from '@/constants/StyleSheet';
import Cardstyle1 from '@/components/Card/Cardstyle1';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigation/RootStackParamList';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS, FONTS } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';
import { getProduct } from '@/api/productsApi';
import React, { useEffect } from 'react';
import { addItemToCart } from '@/redux/slices/cartSlice';
import { t } from 'i18next';
import { useWishlist } from '@/hooks/wishlistHooks';
import { RootState } from '@/redux/store';
import ErrorComponent from '../Components/ErrorComponent';
import { consoleLog } from '@/utils/helpers';

type WishlistScreenProps = StackScreenProps<RootStackParamList, 'Wishlist'>;

const Wishlist = ({ navigation }: WishlistScreenProps) => {

    // Destructure the new `errorMessage` and `refetchWishlist` from the hook
    const { 
        items: wishlistItems, 
        loading: wishlistLoading, 
        errorMessage, 
        refetchWishlist 
    } = useWishlist();

    const theme = useTheme();
    const { colors }: { colors: any } = theme;
    const { userToken } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();


    const handleAddItemToCart = (data: any, productData: any) => {
        dispatch(addItemToCart(data)).unwrap().catch(async (error: any) => {
            const product = await getProduct(productData.product.sku);
            navigation.navigate('ProductsDetails', {
                product
            });
        });
    }

    const discount = (regular_price: number, final_price: number) => {
        return (((regular_price - final_price) / regular_price) * 100).toFixed(0);
    }
    useEffect(()=>{
        consoleLog("errorMessage",errorMessage)
    },[errorMessage])

    return (
        <View style={{ backgroundColor: colors.background, flex: 1 }}>
            <Header
                title={t('my_wishlist')}
                leftIcon={'back'}
                righttitle
                titleLeft
            />
            {/* Use the specific errorMessage. If it exists, show the error component. */}
            {errorMessage ? (
                // Pass the actual error message and the refetch function to the component
                <ErrorComponent 
                    message={errorMessage} 
                    onRetry={refetchWishlist} 
                />
            ) : (
            <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 10, justifyContent: wishlistItems.length === 0 ? 'center' : 'flex-start' }}>
                <View style={[GlobalStyleSheet.container, { paddingHorizontal: 0, padding: 0 }]}>
                    <View style={[GlobalStyleSheet.row]}>
                        {/* Show empty state only when not loading and items are empty */}
                        {!wishlistLoading && wishlistItems.length === 0 &&
                            <View
                                style={{
                                    flex: 1,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    paddingTop: 50, // Added padding to center it better
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
                                    <Feather color={COLORS.primary} size={24} name='heart' />
                                </View>
                                <Text style={{ ...FONTS.h5, color: colors.title, marginBottom: 8 }}>{t('wishlist_empty')}</Text>
                                {!userToken ?
                                (<>
                                <Text
                                        style={{
                                            ...FONTS.fontSm,
                                            color: colors.text,
                                            textAlign: 'center',
                                            paddingHorizontal: 40,
                                            marginBottom: 30,
                                        }}
                                    >{t('please_login_to_use_your_wishlist')}</Text>  
                                </>)
                                : (<>
                                    <Text
                                        style={{
                                            ...FONTS.fontSm,
                                            color: colors.text,
                                            textAlign: 'center',
                                            paddingHorizontal: 40,
                                            marginBottom: 30,
                                        }}
                                    >{t('add_product_to_favourite')}</Text>  
                                </>)}
                            </View>
                        }
                        {wishlistItems.map((data, index: any) => {
                            const percentage = discount(data.product.price_range.maximum_price.regular_price.value, data.product.price_range.maximum_price.final_price.value);
                            return (
                                <View style={[GlobalStyleSheet.col50, { marginBottom: 0, paddingHorizontal: 0 }]} key={index}>
                                    <Cardstyle1
                                        data={data}
                                        id={data.id}
                                        title={data.product.name}
                                        image={data.product.media_gallery[0].url}
                                        sku={data.product.sku}
                                        price={data.product.price_range.maximum_price.final_price.value + ' ' + data.product.price_range.maximum_price.final_price.currency}
                                        offer={percentage > 0 ? percentage + '%' : ''}
                                        color={null}
                                        hascolor={false}
                                        discount={percentage > 0 ? data.product.price_range.maximum_price.regular_price.value + ' ' + data.product.price_range.maximum_price.regular_price.currency : ''}
                                        wishlist={true}
                                        addToCart={true}
                                        onPress={async () => {
                                            try {
                                                const product = await getProduct(data.product.sku);
                                                navigation.navigate('ProductsDetails', {
                                                    product
                                                });
                                            } catch (error) {
                                                // You can add error handling here for getProduct failure
                                            }
                                        }}
                                        onPress5={() => {
                                            handleAddItemToCart({ cartItem: { sku: data.product.sku, qty: 1 } }, data);
                                        }}
                                    />
                                </View>
                            )
                        })}
                    </View>
                </View>
            </ScrollView>)}
        </View>
    )
}

export default Wishlist;