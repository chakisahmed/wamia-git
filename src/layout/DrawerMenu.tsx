import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import { IMAGES } from '../constants/Images';
import { COLORS, FONTS } from '../constants/theme';
import FeatherIcon from 'react-native-vector-icons/Feather';
import ThemeBtn from '@/components/ThemeBtn';
import { useDispatch } from 'react-redux';
import { closeDrawer } from '../redux/actions/drawerAction';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { logout, setUser } from '../redux/slices/authSlice';
import { clearCart } from '@/redux/slices/cartSlice';
import { clearWishlist, fetchWishlist } from '@/redux/slices/wishListSlice';
import { getCustomerDetails } from '../api/customerApi';
import { useTranslation } from 'react-i18next';
import * as Keychain from 'react-native-keychain';

import DeviceInfo from 'react-native-device-info';



const DrawerMenu = () => {
    const userToken = useSelector((state: RootState) => state.auth.userToken);
    const user = useSelector((state: RootState) => state.auth.user);
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const version = DeviceInfo.getVersion();
    const MenuItems = [
        {
            icon: IMAGES.home,
            name: t("home"),
            navigate: "DrawerNavigation",
        },
        {
            icon: IMAGES.producta,
            name: t("products"),
            navigate: "Products",
        },
        // {
        //     icon: IMAGES.components,
        //     name: t("components"),
        //     navigate: "Components",
        // },
        // {
        //     icon: IMAGES.star,
        //     name: t("featured"),
        //     navigate: "Writereview",
        // },
        {
            icon: IMAGES.heart2,
            name: t("wishlist"),
            navigate: "Wishlist",
        },
        {
            icon: IMAGES.order,
            name: t("my_orders"),
            navigate: 'Myorder',
        },
        {
            icon: IMAGES.shopping,
            name: t("my_cart"),
            navigate: 'MyCart',
        },
        // {
        //     icon: IMAGES.chat,
        //     name: t("chat_list"),
        //     navigate: 'Chat',
        // },
        {
            icon: IMAGES.user3,
            name: t("profile"),
            navigate: "Profile",
        },
        {
            icon: IMAGES.logout,
            name: t("logout"),
            navigate: 'SignIn',
        },
    ]





    const theme = useTheme();
    const { colors }: { colors: any } = theme;
    const navigation = useNavigation<any>();


    if (userToken == null || user == undefined) {
        return (
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View
                    style={{
                        flex: 1,
                        backgroundColor: theme.dark ? COLORS.title : colors.card,
                        paddingHorizontal: 15,
                        paddingVertical: 15,
                    }}
                >
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            borderBottomWidth: 1,
                            borderBottomColor: COLORS.primaryLight,
                            paddingBottom: 20,
                            paddingTop: 10,
                            marginHorizontal: -15,
                            paddingHorizontal: 15
                        }}
                    >

                        <View
                            style={{
                                flex: 1,
                            }}
                        >
                            <Text style={[FONTS.fontSemiBold, { color: colors.title, fontSize: 18 }]}>{t("guest_user")}</Text>
                        </View>
                        <View style={{ position: 'absolute', right: 10, top: 0 }}>
                            <ThemeBtn />
                        </View>
                    </View>
                    <View style={{ flex: 1, paddingVertical: 15 }}>
                        {['Sign In'].map((item, index) => (
                            <TouchableOpacity
                                onPress={() => navigation.navigate(item.replaceAll(' ', ''))}
                                key={index}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    paddingVertical: 5,
                                    marginBottom: 0,
                                    justifyContent: 'space-between'
                                }}
                            >
                                <Text style={[FONTS.fontRegular, { color: colors.title, fontSize: 16 }]}>{t(item.toLowerCase().replace(' ', '_'))}</Text>

                            </TouchableOpacity>
                        ))}

                    </View>
                    <View
                        style={{
                            paddingVertical: 10,
                            borderTopWidth: 1,
                            borderTopColor: COLORS.primaryLight,
                            marginHorizontal: -15,
                            paddingHorizontal: 15
                        }}
                    >
                        <Text style={[FONTS.fontSemiBold, { color: colors.title, fontSize: 13 }]}>Wamia Mobile <Text style={[FONTS.fontRegular]}>Ecommerce Store</Text></Text>
                        <Text style={[FONTS.fontRegular, { color: colors.title, fontSize: 13 }]}>{`App Version ${version}`}</Text>
                    </View>
                </View>
            </ScrollView>
        );
    }

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View
                style={{
                    flex: 1,
                    backgroundColor: theme.dark ? COLORS.title : colors.card,
                    paddingHorizontal: 15,
                    paddingVertical: 30,
                }}
            >
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        borderBottomWidth: 1,
                        borderBottomColor: COLORS.primaryLight,
                        paddingBottom: 20,
                        paddingTop: 10,
                        marginHorizontal: -15,
                        paddingHorizontal: 15
                    }}
                >
                    {/* <Image
                        source={{uri:'https://www.wamia.tn/media/catalog/product/placeholder/default/ph_base.jpg'}}
                        style={{
                            height: 60,
                            width: 60,
                            borderRadius: 10,
                            marginRight: 10,
                            marginTop:20
                        }}
                    />  */}
                    <View
                        style={{
                            flex: 1,
                        }}
                    >
                        <Text style={[FONTS.fontSemiBold, { color: colors.title, fontSize: 18 }]}>
                            {user.firstname} {user.lastname}
                        </Text>
                        <Text style={[FONTS.fontRegular, { color: (theme.dark ? COLORS.primaryLight : COLORS.primary), fontSize: 13 }]}>{user.email}</Text>
                    </View>
                    <View style={{ position: 'absolute', right: 10, top: 0 }}>
                        <ThemeBtn />
                    </View>
                </View>
                <View style={{ flex: 1, paddingVertical: 15 }}>
                    {MenuItems.map((data, index) => {
                        return (
                            <TouchableOpacity
                                onPress={async () => {
                                    if (data.name === t("logout")) {
                                        await Keychain.resetGenericPassword()
                                        await AsyncStorage.removeItem('user');
                                        await AsyncStorage.removeItem('guestCartId');
                                        dispatch(clearCart({ callApi: false, token: null }));
                                        dispatch(logout())

                                    }
                                    dispatch(closeDrawer());
                                    navigation.navigate(data.navigate, data.name == t("products") ? { otherFilters: '', page_name: t('all_products') } : null);
                                }}
                                key={index}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    paddingVertical: 5,
                                    marginBottom: 0,
                                    justifyContent: 'space-between'
                                }}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                    <View style={{ height: 40, width: 40, borderWidth: 1, borderColor: COLORS.primaryLight, borderRadius: 4, alignItems: 'center', justifyContent: 'center' }}>
                                        <Image
                                            source={data.icon}
                                            style={{
                                                height: 18,
                                                width: 18,
                                                tintColor: theme.dark ? COLORS.primaryLight : COLORS.primary,
                                                resizeMode: 'contain'
                                            }}
                                        />
                                    </View>
                                    <Text style={[FONTS.fontRegular, { color: colors.title, fontSize: 16 }]}>{t(data.name)}</Text>
                                </View>
                                <FeatherIcon size={20} color={colors.title} name={'chevron-right'} />
                            </TouchableOpacity>
                        )
                    })}
                </View>
                <View
                    style={{
                        paddingVertical: 10,
                        borderTopWidth: 1,
                        borderTopColor: COLORS.primaryLight,
                        marginHorizontal: -15,
                        paddingHorizontal: 15
                    }}
                >
                    <Text style={[FONTS.fontSemiBold, { color: colors.title, fontSize: 13 }]}>Wamia Mobile <Text style={[FONTS.fontRegular]}>Ecommerce Store</Text></Text>
                    <Text style={[FONTS.fontRegular, { color: colors.title, fontSize: 13 }]}>App Version 1.0</Text>
                </View>
            </View>
        </ScrollView>
    )
}

export default DrawerMenu;