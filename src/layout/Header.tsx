import React, { useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    Image,
    Pressable
} from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
//import FeatherIcon from 'react-native-vector-icons/Feather';
import { COLORS, FONTS } from '../constants/theme';
import { Feather } from '@expo/vector-icons';
import { GlobalStyleSheet } from '../constants/StyleSheet';
import { RootStackParamList } from '../navigation/RootStackParamList';
import { StackScreenProps } from '@react-navigation/stack';
import { IMAGES } from '../constants/Images';
import { useDispatch, useSelector } from 'react-redux';
import { CartItem, CartResponse } from '../api/cartApi';
import { t } from 'i18next';
import { RootState } from '@/redux/store';
import { clearCart } from '@/redux/slices/cartSlice';
type IconButtonProps = {
    icon: any;
    onPress: () => void;
    badgeValue?: number;
};

const IconButton = React.memo(({ icon, onPress, badgeValue }: IconButtonProps) => (
    <Pressable onPress={onPress} style={styles.actionBtn}>
        <Image source={icon} style={styles.icon} />
        {badgeValue !== undefined && badgeValue > 0 && (
            <View style={[GlobalStyleSheet.notification, styles.badge]}>
                <Text style={[FONTS.fontRegular, styles.badgeText]}>{badgeValue}</Text>
            </View>
        )}
    </Pressable>
));
type Props = {
    title: string,
    leftIcon?: string,
    leftAction?: any,
    transparent?: any,
    productId?: any,
    titleLeft?: any,
    titleLeft2?: any,
    titleRight?: any,
    rightIcon1?: any,
    rightIcon2?: any,
    righttitle?: any,
    righttitle2?: any,
    data?: CartResponse
}


const Header = ({ title, leftIcon, leftAction, transparent, productId, titleLeft, titleLeft2, titleRight, rightIcon1, rightIcon2, righttitle, righttitle2, data }: Props) => {

    const wishList = useSelector((state: any) => state.wishList.wishList);

    const token =useSelector((state:RootState)=>state.auth.userToken)

    const { details, status, error } = useSelector((state: RootState) => state.cart);

    const cartItems = details?.items || [];
    const dispatch = useDispatch()
    const theme = useTheme();
    const { colors }: { colors: any } = theme;

    const navigation = useNavigation<any>();

    const cartItemCount = useMemo(() => {
        return cartItems?.reduce((total, item) => total + item.qty, 0) ?? 0;
    }, [cartItems]); // This only recalculates when cartItems changes

    const iconConfig = {
    trash: {
        source: IMAGES.delete,
        onPress: () => dispatch(clearCart({ callApi: true, token: token })),
    },
    cart: {
        source: IMAGES.mycart,
        onPress: () => navigation.navigate('MyCart'),
    },
    // You could even add your other icons here for consistency!
    search: {
        isFeather: true, // A flag to differentiate
        name: 'search',
        onPress: () => navigation.navigate('Search'),
    }
};

const currentIcon = iconConfig[rightIcon2];


    return (
        <View
            style={[{
                height: 60,
                backgroundColor: COLORS.primary,
                alignItems: 'center',
                justifyContent: 'center'
            }, transparent && {
                position: 'absolute',
                left: 0,
                right: 0,
                borderBottomWidth: 0,
            }
                // ,Platform.OS === 'ios' && {
                //     backgroundColor:colors.card
                // }
            ]}
        >
            <View style={[GlobalStyleSheet.container, {
                flexDirection: 'row',
                alignItems: 'center',
                paddingLeft: 5,
                justifyContent: 'space-between',
                //paddingTop:10
            }]}
            >
                {leftIcon === 'back' &&
                    <TouchableOpacity
                        onPress={() => leftAction ? leftAction() : navigation.goBack()}
                        style={[styles.actionBtn, {}]}
                    >
                        <Feather size={24} color={COLORS.card} name={'arrow-left'} />
                    </TouchableOpacity>
                }
                <View style={{ flex: 1 }}>
                    <Text style={{ ...FONTS.fontMedium, fontSize: 20, color: COLORS.card, textAlign: titleLeft ? 'left' : 'center', paddingLeft: titleLeft2 ? 10 : 10, paddingRight: titleRight ? 40 : 0 }}>{title}</Text>
                    {productId &&
                        <Text style={{ ...FONTS.fontSm, color: colors.text, textAlign: 'center', marginTop: 2 }}>{productId}</Text>
                    }
                </View>
                {rightIcon1 == "search" &&

                    <TouchableOpacity
                        onPress={() => navigation.navigate('Search')}
                        style={[styles.actionBtn, {}]}
                    >
                        <Feather size={22} color={COLORS.card} name={'search'} />
                    </TouchableOpacity>

                }
                {righttitle &&
                    <View style={[styles.actionBtn, { width: 60 }]}>
                        <Text style={[FONTS.fontMedium, { fontSize: 13, color: COLORS.card }]}>{wishList.length} {t('items')}</Text>
                    </View>
                }

                {righttitle2 &&
                    <View style={[styles.actionBtn, { width: 60 }]}>
                        <Text style={[FONTS.fontMedium, { fontSize: 13, color: COLORS.card }]}>{cartItemCount} {t('items')}</Text>

                    </View>
                }
                {currentIcon && (
    <TouchableOpacity 
        onPress={currentIcon.onPress}
        style={styles.actionBtn}
    >
        <Image
            style={styles.iconImage} // Use a defined style
            source={currentIcon.source}
        />
        
        {/* Special case for the cart notification badge */}
        {rightIcon2 === "cart" && data != null && cartItemCount > 0 && (
            <View style={styles.notificationBadge}>
                <Text style={styles.notificationText}>{cartItemCount}</Text>
            </View>
        )}
    </TouchableOpacity>)}

            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    header: {
        height: 60,
        backgroundColor: COLORS.card,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        ...FONTS.fontMedium,
    },
    actionBtn : {
        height: 35,
        width: 35,
        borderRadius:8,
        alignItems:'center',
        justifyContent : 'center',
    },
    // New styles for the optimized component
    iconImage: {
        height: 20,
        width: 20,
        tintColor: COLORS.card,
    },
    notificationBadge: {
        position: 'absolute',
        right: 0,
        bottom: 20,
        backgroundColor: '#FFE019',
        borderRadius: 10, // Make it circular
        minWidth: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    notificationText: {
        ...FONTS.fontRegular,
        fontSize: 10,
        color: COLORS.title,
    },
})

export default Header;