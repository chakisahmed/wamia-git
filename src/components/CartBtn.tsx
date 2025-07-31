import React, { useState, useEffect, useRef, useCallback } from 'react'
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native'
import { Feather, FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useTheme } from '@react-navigation/native';
import { getCustomerDetails } from '../api/customerApi';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useTimedBoolean } from '@/hooks/useTimedBoolean';
import { CartItem, updateCart } from '@/api/cartApi';
import { addItemToCart, removeItemFromCart, updateItemInCart } from '@/redux/slices/cartSlice';
import { Product } from '@/hooks/productHooks';
import { consoleLog } from '@/utils/helpers';

interface CartBtnProps {
    cartItem?: CartItem;
    onAddMore: () => void;    // Called when the '+' button is pressed
    onRemove: () => void;     // Called when the trash button is pressed
    inCart: () => string[];          // A boolean indicating if the item is in the cart
    product: Product;
    sku: string;
    size?: number;            // Optional icon size
}

const CartBtn = ({ cartItem, product, inCart, size, sku }: CartBtnProps) => {
    const theme = useTheme();
    const { colors }: { colors: any } = theme;

    const [isInCart, setIsInCart] = useState(false);

    const findInCart = (sku:string) => {
        const itemsInCartArray = inCart(); // Call inCart() once to get the current array

        // Check if any item in itemsInCartArray (string) contains the current sku (string)
        const found = itemsInCartArray.some(cartSku => {
            // Ensure both are strings before calling .includes() to avoid errors
            if (typeof cartSku === 'string' && typeof sku === 'string') {
                return cartSku.includes(sku);
            }
            return false; // If sku or cartSku is not a string, it can't contain it
        });

        return found
    }

    useEffect(() => {

        const found = findInCart(sku)


        setIsInCart(found);

        // console.log("cartItem?.qty", cartItem?.qty, " ", sku, " is in cart (substring match): ", found);
        // console.log("Current cart:", itemsInCartArray, "Current SKU:", sku, "Found:", found);

    }, [inCart, sku]);
    const dispatch = useDispatch()

    const [isExpanded, setIsExpanded] = useTimedBoolean(false, 5000); // 5-second pulse
    const token = useSelector((state: RootState) => state.auth.userToken);
    // useRef to hold the timer ID. This allows us to clear it on unmount or on re-interaction.

    type CartRequest = {
        sku: string;
        qty: number;
        product_option?: any;
    };
    const addItemToCartHandler = useCallback((data: Product) => {

        consoleLog("cartItem ", JSON.stringify(cartItem))
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

    // useRef for the animated width value
    const animatedWidth = useRef(new Animated.Value(35)).current;

    useEffect(() => {
        Animated.timing(animatedWidth, {
            toValue: isExpanded ? 120 : 35, // Expanded width vs. collapsed width
            duration: 250,
            useNativeDriver: false, // 'width' animation is not supported by the native driver
        }).start();

    }, [isExpanded]);
    const handleMainPress = () => {
        setIsExpanded();

        if (findInCart(sku)) {
            // If already in cart, expand the button
        } else {
            setIsInCart(true);
            // If not in cart, execute the initial add action
            addItemToCartHandler(product)
        }
    };

    // const handlePress = async () => {


    //     setIsInCart(!isInCart);
    //     if (onPress) {
    //         onPress();
    //     } else {
    //     }


    // };

    const handleRemove = () => {
        dispatch(removeItemFromCart({ itemId: cartItem?.item_id, token }))


    }

    const handleUpdate = (newQty: number) => {
        // Guard against updates if the item doesn't exist in the cart yet
        if (!cartItem?.item_id) return;

        const payload = {
            item_id: cartItem.item_id,
            qty: newQty,
        };

        // There is no more local state to manage. Just dispatch the action.
        // Redux will handle the optimistic update, rollback, and final state.
        dispatch(updateItemInCart({ cartItem: payload, token }));

        // You can still use setIsExpanded to manage the button's visual state
        setIsExpanded();
    };


    const containerInCartStyle = isInCart && {
        backgroundColor: COLORS.secondary,

    };

    const iconColor = isInCart ? 'white' : (theme.dark ? 'white' : colors.text);

    return (
        <Animated.View style={[styles.container, { width: animatedWidth }, containerInCartStyle]}>
            {isExpanded && cartItem ? (
                <View style={styles.expandedView}>
                    {cartItem?.qty && cartItem.qty == 1 ? (<Pressable onPress={handleRemove} hitSlop={10}>
                        <Feather name="trash-2" size={size ?? 18} color={iconColor} />
                    </Pressable>)
                        : (<Pressable onPress={() => {
                            if (cartItem?.qty) handleUpdate(cartItem?.qty - 1)
                        }} hitSlop={10}>
                            <Feather name="minus" size={size ?? 18} color={iconColor} />
                        </Pressable>)}
                    <Text style={[styles.quantityText, { color: iconColor }]}>{cartItem?.qty ?? ""}</Text>
                    <Pressable onPress={() => {

                        if (cartItem?.qty) handleUpdate(cartItem?.qty + 1)
                    }} hitSlop={10}>
                        <Feather name="plus" size={size ?? 18} color={iconColor} />
                    </Pressable>
                </View>
            ) : (
                <Pressable
                    accessible={true}
                    accessibilityLabel="Cart Button"
                    accessibilityHint={inCart().includes(sku) ? "Update quantity in cart" : "Add this item to cart"}
                    onPress={handleMainPress}
                    style={styles.pressableTarget}
                >
                    <Feather size={size ?? 16} color={iconColor} name="shopping-cart" />
                </Pressable>
            )}
        </Animated.View>
    );
};

// Using StyleSheet for performance and organization
const styles = StyleSheet.create({
    container: {
        height: 35,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        elevation: 3,
        backgroundColor: 'white', // Default background, will be overridden by theme/inCart logic
        overflow: 'hidden', // Ensures the content inside doesn't spill out during animation
    },
    pressableTarget: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    expandedView: {
        flex: 1,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 10,
    },
    quantityText: {
        fontWeight: 'bold',
        fontSize: 16,
    }
});

// Setting default props to avoid errors if they are not passed
CartBtn.defaultProps = {
    size: 16,
    theme: { dark: false, colors: { text: 'black', primaryLight: '#e0f2f1' } },
};

export default CartBtn;