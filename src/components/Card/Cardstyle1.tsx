import React, { useCallback, useEffect, useState } from 'react'
import { View, Text, Image, TouchableOpacity, ToastAndroid } from 'react-native'
import { COLORS, FONTS } from '@/constants/theme';
import { useNavigation, useTheme } from '@react-navigation/native';
import LikeBtn from '../LikeBtn';
import { useDispatch, useSelector } from 'react-redux';
import { t } from 'i18next';
import CartBtn from '../CartBtn';
import { useWishlist } from '@/hooks/wishlistHooks';
import { RootState } from '@/redux/store';
import { CartItem } from '@/api/cartApi';
import { Product } from '@/hooks/productHooks';
import CustomTag from '../CustomTag';
import { addItemToCart, removeItemFromCart } from '@/redux/slices/cartSlice';
import { consoleLog } from '@/utils/helpers';
import { AsyncThunkAction } from '@reduxjs/toolkit';
import { UnknownAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';


type Props = {
    data?: Product;
    id: string,
    title: string;
    color: any;
    //style ?: object;
    //rounded ?: any;
    //size ?: string;
    price: string;
    sku?: string;
    image?: any;
    offer: string;
    hascolor?: any;
    brand?: any;
    discount?: any;
    wishlist?: any;
    borderTop?: any;
    onPress?: (e: any) => void,
    onPress3?: (e: any) => void,
    onPress4?: any,
    onPress5?: any,
    addToCart?: boolean
    // onpress:string;
}

const Cardstyle1 = ({ data, sku, title, price, image, offer, hascolor, onPress, discount, borderTop, onPress4, onPress5, addToCart }: Props) => {

    const theme = useTheme();
    const { colors }: { colors: any } = theme;



    const [show, setshow] = useState(false)
    const dispatch=useDispatch()

    const { details } = useSelector((state: RootState) => state.cart);
    const cart = details?.items
    const brand = useSelector((state: RootState) => state.homepage.brand);


    const { wishlistSkus, items: wishlistItems, addProduct, removeProduct, loading: wishlistLoading } = useWishlist();
    const userToken = useSelector((state: RootState) => state.auth.userToken); // Still needed for the check

    // This replaces the old `inWishlist()` selector logic. It's now a simple, fast Set lookup.
    const isLiked = sku ? wishlistSkus.has(sku) : false;
    const inCart = () => {
        var temp = [] as string[];
        cart?.forEach((data: CartItem) => {
            temp.push(data.sku);
        });
        return temp;
    }
    const token = useSelector((state: RootState) => state.auth.userToken);


    const cartItem = () => {
        return sku ? cart?.find((item) => item.sku.includes(sku)) : null
    }
    type CartRequest = {
        sku: string;
        qty: number;
        product_option?: any;
    };

    const handleRemove = () => {
        const item = cartItem()
        if (item)
            dispatch(removeItemFromCart({ itemId: item.item_id, token }))


    }


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
                cartItem,
                token

            }));
            //ToastAndroid.show(t("item_added_to_cart"), ToastAndroid.SHORT);
        } catch (error) {
            console.error('Error adding item to cart:', error);
        }
    }, [dispatch]);

    const handleLikePress = () => {


        if (!sku) return;

        if (isLiked) {
            // Find the full wishlist item to get its ID for removal
            const itemToRemove = wishlistItems.find(item => item.product.sku === sku);
            if (itemToRemove) {
                removeProduct(itemToRemove.id);
            }
        } else {
            addProduct(sku);
        }
    };


    return (
        <TouchableOpacity
            activeOpacity={.8}
            style={{
                backgroundColor: theme.dark ? 'rgba(255,255,255,.1)' : colors.card,
                borderRightWidth: 1,
                borderRightColor: COLORS.primaryLight,
                width: '100%',
                height: undefined,
                //aspectRatio:hascolor ? wishlist ? 1/1.55 : 1/1.3 : 1/1.4,
                borderTopWidth: hascolor ? 1 : borderTop ? 1 : 0,
                borderTopColor: COLORS.primaryLight,
                paddingBottom: 5,
                borderBottomColor: COLORS.primaryLight,
                borderBottomWidth: 1,
            }}
            onPress={onPress}
        >
            <View style={{ height: undefined, width: '100%', aspectRatio: 1 / 1, alignItems: 'center', justifyContent: 'center' }}>
                <Image
                    style={{ height: undefined, width: '100%', aspectRatio: 1 / 1, resizeMode: 'contain' }}
                    source={{ uri: image }}
                />
                {/* <TouchableOpacity style={{ position: 'absolute', right: 5, bottom: 20 }}>
                    {sku && <CartBtn
                        sku={sku}
                        product={data}
                        cartItem={cartItem()}

                        inCart={inCart}
                        onAddMore={() => { }}
                        onRemove={() => { }}
                    />}
                </TouchableOpacity> */}
            </View>
            <TouchableOpacity style={{ position: 'absolute', right: -7, top: -5 }}>
                <LikeBtn
                    isLiked={isLiked}
                    onPress={handleLikePress}
                    disabled={wishlistLoading} // Disable the button while adding/removing
                />
            </TouchableOpacity>



            <View style={{ paddingHorizontal: 10, marginTop: 10 }}>
                {/* {data?.brand && data.brand!="9971" && <Text style={[FONTS.fontMedium, { fontSize: 12, color: "blue", paddingRight: 30 }]}>{brand[data?.brand]}</Text>} */}
                <Text numberOfLines={1} style={[FONTS.fontMedium, { fontSize: 12, color: colors.title, marginTop: 5, paddingRight: 10 }]}>{title}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5, gap: 5 }}>
                    <Text style={[FONTS.fontMedium, { fontSize: 14, color: colors.title }]}>{price}</Text>
                    <Text style={[FONTS.fontJostLight, { fontSize: 12, color: colors.title, textDecorationLine: 'line-through', opacity: .6 }]}>{discount}</Text>
                    <Text style={[FONTS.fontRegular, { fontSize: 12, color: COLORS.danger, }]}>{offer}</Text>

                </View>



                <View style={{ alignItems: 'flex-start', height: 30, marginTop: 10 }}>
                    {data?.mode_expedition && (
                        <CustomTag code={data.mode_expedition} roundedSide="right" style={{}} />
                    )}
                </View>
            </View>



            {/* {addToCart ?
                <View style={{ paddingHorizontal: 15, marginTop: 10, }}>
                    <TouchableOpacity
                        onPress={() => {
                            consoleLog(JSON.stringify(data))
                            if (data) {
                                if (inCart().includes(data.sku)) handleRemove()
                                else addItemToCartHandler(data)
                            }
                        }}
                        activeOpacity={0.5}
                        style={{
                            height: 40,
                            width: '100%',
                            borderWidth: 2,
                            borderColor: theme.dark ? (show ? COLORS.darkCard : COLORS.primaryLight) : (show ? COLORS.primary : COLORS.primaryLight),
                            borderRadius: 4,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: theme.dark ? (show ? COLORS.primaryLight : COLORS.darkCard) : (show ? COLORS.primary : colors.card)
                        }}
                    >
                        <Text style={[FONTS.fontMedium, { fontSize: 14, color: theme.dark ? (show ? COLORS.primary : COLORS.primaryLight) : (show ? COLORS.card : COLORS.primary) }]}>{t("add_to_cart")}</Text>
                    </TouchableOpacity>
                </View>
                :
                null
            } */}
        </TouchableOpacity>
    )
}

export default Cardstyle1

function dispatch(arg0: AsyncThunkAction<CartItem, any, { state?: unknown; dispatch?: ThunkDispatch<unknown, unknown, UnknownAction>; extra?: unknown; rejectValue?: unknown; serializedErrorType?: unknown; pendingMeta?: unknown; fulfilledMeta?: unknown; rejectedMeta?: unknown; }>) {
    throw new Error('Function not implemented.');
}
