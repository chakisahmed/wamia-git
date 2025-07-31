import { useTheme } from '@react-navigation/native';
import React, { useRef } from 'react'
import { View, Text, TouchableOpacity, Image, SectionList } from 'react-native'
import { GlobalStyleSheet } from '@/constants/StyleSheet';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { IMAGES } from '@/constants/Images';
import { COLORS, FONTS } from '@/constants/theme';
//import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigation/RootStackParamList';
import { useDispatch } from 'react-redux';
import { openDrawer } from '@/redux/actions/drawerAction';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import {  logout  } from '@/redux/slices/authSlice';
import { CustomerDetails } from '@/api/customerApi';
import { useTranslation } from 'react-i18next';
import { clearCart } from '@/redux/slices/cartSlice';
import { clearWishlist } from '@/redux/slices/wishListSlice';
import * as Notifications from 'expo-notifications';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import * as Keychain from 'react-native-keychain';
import { useWishlist } from '@/hooks/wishlistHooks';





type ProfileScreenProps = StackScreenProps<RootStackParamList, 'Profile'>;

const Profile = ({ navigation }: ProfileScreenProps) => {
    const { t } = useTranslation();
    //const {} = useWishlist()

    const theme = useTheme();
    const { colors }: { colors: any } = theme;


    //const navigation = useNavigation();
    const ref = useRef<any>(null);

    const dispatch = useDispatch();
    const userToken = useSelector((state: RootState) => state.auth.userToken);
    const user = useSelector((state: RootState) => state.auth.user);
    const btnData = [
        {
            title: t("your_order"),
            navigate: 'Myorder',
        },
        {
            title: t("wishlist"),
            navigate: 'Wishlist',
        },
        {
            title: t("products"),
            navigate: 'Products',
        },
        {
            title: t("categories"),
            navigate: 'Category',
        },
    ]

    const ListwithiconData = [
        {
            title: t('account_settings'),
            data: [
                {
                    icon: IMAGES.user3,
                    title: t("edit_profile"),
                    navigate: 'EditProfile'
                },
                {
                    icon: IMAGES.map,
                    title: t("saved_addresses"),
                    navigate: 'DeliveryAddress2',
                    disableOrderButton: true
                },
                {
                    icon: IMAGES.translation,
                    title: t("select_language"),
                    navigate: 'Language'
                },
                {
                    icon: IMAGES.ball,
                    title: t("notifications_settings"),
                    navigate: 'Notification'
                },
                {
                    icon: IMAGES.rma,
                    title: t("rma"),
                    navigate: 'ListRMA'
                },
            ],
        },
        {
            title: t('my_activity'),
            data: [
                {
                    icon: IMAGES.chat,
                    title: t("questions_answers"),
                    navigate: 'Questions'
                },
                userToken && user != null ?
                    {
                        icon: IMAGES.logout,
                        title: t("logout"),
                        navigate: 'SignInPhone'
                    } :
                    {
                        icon: IMAGES.login,
                        title: t("login"),
                        navigate: 'SignInPhone'
                    },
            ].filter(Boolean), // Filter out any false values
        },
    ];


    return (
        <ErrorBoundary>

            <View style={{ backgroundColor: colors.background, flex: 1 }}>
                <View style={{ height: 60, backgroundColor: COLORS.primary }}>
                    <View style={[GlobalStyleSheet.container, { paddingHorizontal: 20 }]}>
                        <View style={[GlobalStyleSheet.row, { alignItems: 'center', justifyContent: 'space-between' }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <TouchableOpacity
                                    style={{ margin: 5 }}
                                    onPress={() => dispatch(openDrawer())}
                                >
                                    <Image
                                        style={{ height: 22, width: 22, tintColor: COLORS.card, resizeMode: 'contain' }}
                                        source={IMAGES.grid5}
                                    />
                                </TouchableOpacity>
                                <Image
                                    style={{ resizeMode: 'cover', height: 120, width: 120, aspectRatio: 5, marginBottom: 3 }}

                                    source={IMAGES.appname}
                                />
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('Search')}
                                    style={{
                                        height: 35,
                                        width: 35,
                                        // borderRadius:8,
                                        // backgroundColor:theme.dark ? 'rgba(255,255,255,0.10)' : COLORS.background,
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <Image
                                        style={{ height: 22, width: 22, tintColor: COLORS.card, resizeMode: 'contain' }}
                                        source={IMAGES.search}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={async () => {
                                        const { status: existingStatus } = await Notifications.getPermissionsAsync();
                                        if (existingStatus !== 'granted') {
                                            ref.current.openSheet('notification')
                                        }
                                        else {
                                            navigation.navigate('Notification')
                                        }

                                    }
                                    }
                                    style={{
                                        height: 35,
                                        width: 35,
                                        // borderRadius:8,
                                        // backgroundColor:theme.dark ? 'rgba(255,255,255,0.10)' : COLORS.background,
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <Image
                                        style={{ height: 20, width: 20, tintColor: COLORS.card, resizeMode: 'contain' }}
                                        source={IMAGES.ball}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={[GlobalStyleSheet.container, { paddingTop: 20, backgroundColor: theme.dark ? 'rgba(255,255,255,.1)' : colors.card }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: 20 }}>
                        <Image
                            style={{ height: 40, width: 40, borderRadius: 50 }}
                            source={{ uri: 'https://www.wamia.tn/media/catalog/product/placeholder/default/ph_base.jpg' }}
                        />
                        <Text style={{ ...FONTS.fontRegular, fontSize: 20, color: colors.title }}>{userToken && user != null ? user.firstname + " " + user.lastname : t('guest_user')}</Text>
                    </View>
                    <View style={GlobalStyleSheet.row}>
                        {btnData.map((data: any, index) => {
                            return (
                                <View key={index}
                                    style={[GlobalStyleSheet.col50, { marginBottom: 10, paddingHorizontal: 5 }]}>
                                    <TouchableOpacity
                                        onPress={() => {

                                            if (data.navigate == 'Myorder' || data.navigate === 'Wishlist') {

                                                if (userToken && user != null) {
                                                    navigation.navigate(data.navigate, { onGoBack: (user: CustomerDetails) => setUser(user) });
                                                } else {
                                                    navigation.navigate('SignIn');
                                                }
                                            } else {
                                                navigation.navigate(data.navigate);
                                            }

                                        }}
                                        style={{
                                            height: 46,
                                            width: '100%',
                                            backgroundColor: colors.card,
                                            borderWidth: 1,
                                            borderColor: COLORS.primaryLight,
                                            //borderRadius:8,
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <Text style={[FONTS.fontMedium, { fontSize: 16, color: colors.title }]}>{data.title}</Text>
                                    </TouchableOpacity>
                                </View>
                            )
                        })}
                    </View>
                </View>
                <View style={[GlobalStyleSheet.container, { flex: 1, paddingTop: 0 }]}>
                    <View style={{ marginHorizontal: -15, marginTop: 0, flex: 1 }}>
                        <SectionList
                            sections={ListwithiconData}
                            keyExtractor={(item: any, index) => item + index}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    activeOpacity={.8}

                                    onPress={async () => {
                                        if (['EditProfile','DeliveryAddress2','ListRMA'].includes(item.navigate)) {
                                            if (user != null) {
                                                navigation.navigate(item.navigate);
                                            } else {
                                                navigation.navigate("SignInPhone",{redirectTo:item.navigate});
                                            }
                                        } else {
                                            if (item.title == t("logout")) {
                                                await Keychain.resetGenericPassword()
                                                await AsyncStorage.removeItem('user');
                                                await AsyncStorage.removeItem('guestCartId');
                                                dispatch(clearCart({callApi: false, token: null}));
                                                dispatch(logout())
                                                
                                                //dispatch(clearWishlist())
                                            }
                                            navigation.navigate(item.navigate);
                                        }
                                    }}
                                    style={{
                                        flexDirection: 'row',
                                        paddingHorizontal: 15,
                                        height: 60,
                                        alignItems: 'center',
                                        paddingVertical: 0,
                                        //borderRadius: SIZES.radius,
                                        backgroundColor: theme.dark ? 'rgba(255,255,255,.1)' : colors.card,

                                    }}
                                >
                                    <View style={{
                                        height: 30,
                                        width: 30,
                                        borderRadius: 6,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 10,
                                    }}>
                                        <Image
                                            style={{
                                                height: 20,
                                                width: 20,
                                                tintColor: theme.dark ? COLORS.primaryLight : COLORS.primary,
                                                resizeMode: 'contain',
                                            }}
                                            source={item.icon}
                                        />
                                    </View>
                                    <Text style={{ ...FONTS.fontRegular, fontSize: 16, color: colors.title, flex: 1 }}>{item.title}</Text>
                                    <FeatherIcon size={22} color={colors.title} name={'chevron-right'} />
                                    {/* <Ionicons  style={{opacity:.8}} color={colors.title} name='chevron-forward' size={20}/> */}
                                </TouchableOpacity>
                            )}
                            renderSectionHeader={({ section: { title } }) => (
                                <Text
                                    style={{
                                        ...FONTS.fontMedium,
                                        fontSize: 20,
                                        color: colors.title,
                                        paddingLeft: 20,
                                        paddingVertical: 10,
                                        backgroundColor: theme.dark ? 'rgba(255,255,255,.1)' : COLORS.white,
                                        borderBottomWidth: 1,
                                        borderBottomColor: COLORS.primaryLight,
                                        marginTop: 10
                                    }}
                                >{title}</Text>
                            )}
                        />
                    </View>
                </View>
            </View>
        </ErrorBoundary>

    )
}

export default Profile