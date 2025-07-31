import { useTheme } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    TouchableOpacity,
    Modal,
    StyleSheet,
} from 'react-native';
import { IMAGES } from '@/constants/Images';
import Header from '@/layout/Header';
import { COLORS, FONTS } from '@/constants/theme';
import { GlobalStyleSheet } from '@/constants/StyleSheet';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Button from '@/components/Button/Button';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigation/RootStackParamList';
import { Address, BillingAddress, getCart } from '@/api/cartApi';
import { useTranslation } from 'react-i18next';
import { getCustomerDetails } from '@/api/customerApi';
import { removeAddress, setDefaultAddress } from '@/api/addressesApi';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { consoleLog } from '@/utils/helpers';
import { setUser } from '@/redux/slices/authSlice';

type DeliveryAddressScreenProps = StackScreenProps<RootStackParamList, 'DeliveryAddress'>;

const DeliveryAddress = ({ navigation }: DeliveryAddressScreenProps) => {
    //const {disableOrderButton} = route.params as {disableOrderButton: boolean|null};
    const [shippingAddress, setShippingAddress] = useState<Address[]>([]);
    const [billingAddress, setBillingAddress] = useState<Address[]>([]);
    const [guestAddresses, setGuestAddresses] = useState<Address[]>([]);
    const theme = useTheme();
    const { colors }: { colors: any } = theme;
    const [isChecked, setIsChecked] = useState<Address | null>(null);
    const [isChecked2, setIsChecked2] = useState<Address | null>(null);
    const [addedAddress, setAddedAddress] = useState<any>(null);
    const dispatch = useDispatch()
        
    const [adresses, setAdresses] = useState<{ shipping: BillingAddress | null; billing: BillingAddress | null }>({
        shipping: null,
        billing: null,
    });

    // New state variables for modal visibility


    const { t } = useTranslation();

    // New state variables for modal visibility
    const [showShippingModal, setShowShippingModal] = useState(false);
    const [showBillingModal, setShowBillingModal] = useState(false);

    const user = useSelector((state: RootState) => state.auth.user);
    const token = useSelector((state: RootState) => state.auth.userToken);

    useEffect(() => {

        const loadAddresses = () => {
            if (user) {
                const customerAddresses = user.addresses;

                const shipping = customerAddresses.find((address) => address.default_shipping);
                const billing = customerAddresses.find((address) => address.default_billing);

                const customerDefaultAddresses = { shipping: shipping, billing: billing };
                setShippingAddress(customerAddresses);
                setBillingAddress(customerAddresses);

                setAdresses(customerDefaultAddresses);
                setIsChecked(shipping);
                setIsChecked2(billing);
            }



        };
        loadAddresses();
    }, [user]);

    const [menuVisible, setMenuVisible] = useState<number | null>(null);

    const openMenu = (index: number) => setMenuVisible(index);
    const closeMenu = () => setMenuVisible(null);


    return (
        <ErrorBoundary>
        <View style={{ backgroundColor: theme.dark ? COLORS.darkBackground : colors.background, flex: 1 }}>
            <Header
                title={t("delivery_address")}
                leftIcon="back"
                titleLeft
                righttitle={t("address_count", { count: 4 })}
                titleRight
            />
            <View
                style={[
                    GlobalStyleSheet.container,
                    {
                        paddingHorizontal: 15,
                        backgroundColor: theme.dark ? COLORS.darkCard : colors.card,
                        shadowColor: '#000',
                        shadowOffset: {
                            width: 0,
                            height: 4,
                        },
                        shadowOpacity: 0.35,
                        shadowRadius: 6.27,
                        elevation: 5,
                    },
                ]}
            >
                {/* Your existing header code */}
            </View>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View
                    style={[
                        GlobalStyleSheet.container,
                        {
                            paddingTop: 10,
                            backgroundColor: theme.dark ? COLORS.darkCard : colors.card,
                            marginTop: 15,
                        },
                    ]}
                >
                    {/* Shipping Address Section */}
                    <Text style={{ ...FONTS.fontMedium, fontSize: 20, color: theme.dark ? COLORS.darkTitle : colors.title }}>
                        {t("shipping_address")}
                    </Text>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: theme.dark ? COLORS.darkInput : COLORS.primaryLight }]}
                        onPress={() => setShowShippingModal(true)}
                    >
                        <Text style={[styles.buttonText, { color: theme.dark ? COLORS.darkTitle : COLORS.title }]}>
                            {adresses.shipping ? t("change_shipping_address") : t("select_shipping_address")}
                        </Text>
                    </TouchableOpacity>
                    {adresses.shipping && (
                        <View style={{ marginTop: 10 }}>
                            <Text style={[styles.addressText, { color: theme.dark ? COLORS.darkText : COLORS.text }]}>
                                {`${adresses.shipping.street.join(' ')} ${adresses.shipping.city} ${adresses.shipping.region.region ?? adresses.shipping.region} ${adresses.shipping.postcode}`}
                            </Text>
                        </View>
                    )}

                    {/* Separator */}
                    <View style={{ height: 2, backgroundColor: theme.dark ? "rgb(27, 27, 27)" : COLORS.background, marginVertical: 20 }}></View>

                    {/* Billing Address Section */}
                    <Text style={{ ...FONTS.fontMedium, fontSize: 20, color: theme.dark ? COLORS.darkTitle : colors.title }}>
                        {t("billing_address")}
                    </Text>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: theme.dark ? COLORS.darkInput : COLORS.primaryLight }]}
                        onPress={() => setShowBillingModal(true)}
                    >
                        <Text style={[styles.buttonText, { color: theme.dark ? COLORS.darkTitle : COLORS.title }]}>
                            {adresses.billing ? t("change_billing_address") : t("select_billing_address")}
                        </Text>
                    </TouchableOpacity>
                    {adresses.billing && (
                        <View style={{ marginTop: 10 }}>
                            <Text style={[styles.addressText, { color: theme.dark ? COLORS.darkText : COLORS.text }]}>

                                {`${adresses.billing.street.join(' ')} ${adresses.billing.city} ${adresses.billing.region.region ?? adresses.billing.region} ${adresses.billing.postcode}`}
                            </Text>
                        </View>
                    )}

                    {/* Separator */}
                    <View style={{ height: 2, backgroundColor: theme.dark ? "rgb(27, 27, 27)" : COLORS.background, marginTop: 20 }}></View>


                    {/* Add Address Button */}
                    <TouchableOpacity
                        style={{
                            height: 48,
                            width: '100%',
                            backgroundColor: theme.dark ? COLORS.darkInput : COLORS.primaryLight,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingHorizontal: 10,
                            marginTop: 30,
                        }}
                        onPress={() => navigation.navigate('AddDeliveryAddress', {
                            onGoBack: (address: any) => {
                                // Handle the address data
                                // Update the shipping and billing addresses
                                setAddedAddress(address);
                                setAdresses({
                                    shipping: address,
                                    billing: address,
                                });
                                setShippingAddress([...shippingAddress, address]);
                                setBillingAddress([...billingAddress, address]);
                            },
                        })}
                    >
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <Image
                                style={{
                                    height: 20,
                                    width: 20,
                                    resizeMode: 'contain',
                                    tintColor: theme.dark ? COLORS.primaryLight : COLORS.primary,
                                }}
                                source={IMAGES.plus}
                            />
                            <Text
                                style={{ ...FONTS.fontMedium, fontSize: 14, color: theme.dark ? COLORS.darkTitle : colors.title }}
                            >
                                {t("add_address")}
                            </Text>
                        </View>
                        <Feather size={22} color={theme.dark ? COLORS.darkTitle : colors.title} name={'chevron-right'} />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={showShippingModal}
                onRequestClose={() => setShowShippingModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, { backgroundColor: theme.dark ? "rgb(34, 34, 34)" : colors.card, width: '90%' }]}>
                        <Text style={[styles.modalTitle, { color: theme.dark ? COLORS.darkTitle : COLORS.title }]}>{t("select_shipping_address")}</Text>
                        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                            {shippingAddress != null &&
                                shippingAddress.map((data, index) => (
                                    <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <TouchableOpacity
                                            key={index}
                                            onPress={() => {
                                                setAdresses({
                                                    shipping: data,
                                                    billing: adresses.billing,
                                                });
                                                setIsChecked(data);
                                                setShowShippingModal(false);
                                            }}
                                            style={[styles.addressItem]}
                                        >
                                            <View style={{ flexDirection: 'column', width: '90%' }}>

                                                <Text style={[styles.addressTitle, { color: theme.dark ? COLORS.darkTitle : COLORS.title }]}>
                                                    {t("shipping_address") + ' ' + (index + 1)}
                                                    {data.default_shipping && <View>

                                                        <Text style={{ fontSize: 12, backgroundColor: COLORS.secondary, borderRadius: 2, marginLeft: 5 }}>
                                                            {` ${t("default")} `}
                                                        </Text>
                                                    </View>}
                                                </Text>
                                                <Text style={[styles.addressText, { color: theme.dark ? COLORS.darkText : COLORS.text }]}>
                                                    {`${data.street.join(' ')} ${data.city} ${data.region.region ?? data.region} ${data.postcode}`}
                                                </Text>
                                            </View>
                                            <TouchableOpacity style={{ marginTop: 10, marginLeft: 10 }} onPress={() => menuVisible === index ? closeMenu() : openMenu(index)}>
                                                <MaterialCommunityIcons name="dots-vertical" size={24} color="black" />
                                            </TouchableOpacity>
                                            {menuVisible === index && (
                                                <View style={styles.menuOptions}>
                                                    {["Set as default", "Delete"].map((option, index) => (
                                                        <TouchableOpacity
                                                            key={index}
                                                            style={styles.menuOption}
                                                            onPress={() => {
                                                                if (option === "Set as default") {
                                                                    // Handle setting as default
                                                                    setDefaultAddress(token, data.id, { billing: false, shipping: true }).then((res) => {
                                                                        //consoleLog(JSON.stringify(res.data))
                                                                        dispatch(setUser(res.data))
                                                                        setShippingAddress((prevAddresses) => {
                                                                            return prevAddresses.map((address) => {
                                                                                if (address.id === data.id) {
                                                                                    return { ...address, default_shipping: true };
                                                                                }
                                                                                return { ...address, default_shipping: false };
                                                                            });
                                                                        });
                                                                        setAdresses({
                                                                            shipping: data,
                                                                            billing: adresses.billing,
                                                                        });
                                                                    })
                                                                } else if (option === "Delete") {
                                                                    if (data.default_billing) {
                                                                        alert(t("cannot_delete_default_billing_address"));
                                                                        return;
                                                                    }
                                                                    if (data.default_shipping) {
                                                                        alert(t("cannot_delete_default_shipping_address"));
                                                                        return;
                                                                    }
                                                                    removeAddress(token, data.id).then(() => {
                                                                        setAdresses((add) => {
                                                                            const defaultShipping = shippingAddress.find((address) => address.default_shipping === true && address.id !== data.id);
                                                                            const defaultBilling = billingAddress.find((address) => address.default_billing === true && address.id !== data.id);
                                                                            setShippingAddress((prevAddresses) => prevAddresses.filter((address) => address.id !== data.id));
                                                                            setBillingAddress((prevAddresses) => prevAddresses.filter((address) => address.id !== data.id));
                                                                            return {
                                                                                shipping: defaultShipping,
                                                                                billing: defaultBilling ?? (data.id == add.billing?.id ? null : add.billing),
                                                                            }

                                                                        })
                                                                    })
                                                                }
                                                                closeMenu();
                                                            }}
                                                        >
                                                            <Text>{option}</Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            )}


                                        </TouchableOpacity>


                                    </View>
                                ))}
                        </ScrollView>
                        <Button
                            style={{ marginTop: 0 }}
                            title={t("close")}
                            color={COLORS.secondary}
                            text={theme.dark ? COLORS.darkTitle : COLORS.title}
                            onPress={() => setShowShippingModal(false)}
                        />
                    </View>

                </View>
            </Modal>

            {/* Billing Addresses Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showBillingModal}
                onRequestClose={() => setShowBillingModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, { backgroundColor: theme.dark ? "rgb(34, 34, 34)" : colors.card, width: '90%' }]}>
                        <Text style={[styles.modalTitle, { color: theme.dark ? COLORS.darkTitle : COLORS.title }]}>{t("select_billing_address")}</Text>
                        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                            {billingAddress != null &&
                                billingAddress.map((data, index) => (
                                    <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <TouchableOpacity
                                            key={index}
                                            onPress={() => {
                                                setAdresses({
                                                    shipping: adresses.shipping,
                                                    billing: data,
                                                });
                                                setIsChecked2(data);
                                                setShowBillingModal(false);
                                            }}
                                            style={styles.addressItem}
                                        >
                                            <View style={{ flexDirection: 'column', width: '90%' }}>
                                                <Text style={[styles.addressTitle, { color: theme.dark ? COLORS.darkTitle : COLORS.title }]}>
                                                    {t("billing_address") + ' ' + (index + 1)}
                                                    {data.default_billing && <View>

                                                        <Text style={{ fontSize: 12, backgroundColor: COLORS.secondary, borderRadius: 2, marginLeft: 5 }}>
                                                            {data.default_billing ? ` ${t("default")} ` : ''}
                                                        </Text>
                                                    </View>}
                                                </Text>
                                                <Text style={[styles.addressText, { color: theme.dark ? COLORS.darkText : COLORS.text }]}>
                                                    {`${data.street.join(' ')} ${data.city} ${data.region.region ?? data.region} ${data.postcode}`}
                                                </Text>
                                            </View>
                                            <TouchableOpacity style={{ marginTop: 10, marginLeft: 10 }} onPress={() => menuVisible === index + 1000 ? closeMenu() : openMenu(index + 1000)}>
                                                <MaterialCommunityIcons name="dots-vertical" size={24} color="black" />
                                            </TouchableOpacity>
                                            {menuVisible === index + 1000 && (
                                                <View style={styles.menuOptions}>
                                                    {["Set as default", "Delete"].map((option, optIdx) => (
                                                        <TouchableOpacity
                                                            key={optIdx}
                                                            style={styles.menuOption}
                                                            onPress={() => {
                                                                if (option === "Set as default") {
                                                                    setDefaultAddress(token, data.id, { billing: true, shipping: false }).then((res) => {
                                                                        //consoleLog(JSON.stringify(res.data))
                                                                        dispatch(setUser(res.data))

                                                                        setBillingAddress((prevAddresses) => {
                                                                            return prevAddresses.map((address) => {
                                                                                if (address.id === data.id) {
                                                                                    return { ...address, default_billing: true };
                                                                                }
                                                                                return { ...address, default_billing: false };
                                                                            });
                                                                        });
                                                                        setAdresses({
                                                                            shipping: adresses.shipping,
                                                                            billing: data,
                                                                        });
                                                                    });
                                                                } else if (option === "Delete") {
                                                                    if (data.default_billing) {
                                                                        alert(t("cannot_delete_default_billing_address"));
                                                                        return;
                                                                    }
                                                                    if (data.default_shipping) {
                                                                        alert(t("cannot_delete_default_shipping_address"));
                                                                        return;
                                                                    }
                                                                    removeAddress(token,data.id).then(() => {
                                                                        

                                                                        setAdresses((add) => {
                                                                            setBillingAddress((prevAddresses) => prevAddresses.filter((address) => address.id !== data.id));
                                                                            setShippingAddress((prevAddresses) => prevAddresses.filter((address) => address.id !== data.id));
                                                                            const defaultShipping = shippingAddress.find((address) => address.default_shipping === true && address.id !== data.id);
                                                                            const defaultBilling = billingAddress.find((address) => address.default_billing === true && address.id !== data.id);
                                                                            return {
                                                                                shipping: defaultShipping ?? (data.id == add?.shipping?.id ? null : add.shipping),
                                                                                billing: defaultBilling,
                                                                            }
                                                                        });
                                                                    });
                                                                }
                                                                closeMenu();
                                                            }}
                                                        >
                                                            <Text>{option}</Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                ))}
                        </ScrollView>
                        <Button
                            style={{ marginTop: 0 }}
                            title={t("close")}
                            color={COLORS.secondary}
                            text={theme.dark ? COLORS.darkTitle : COLORS.title}
                            onPress={() => setShowBillingModal(false)}
                        />
                    </View>
                </View>
            </Modal>


        </View></ErrorBoundary>
    );
};

export default DeliveryAddress;

const styles = StyleSheet.create({
    button: {
        height: 48,
        width: '100%',
        backgroundColor: COLORS.primaryLight,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
        marginTop: 20,
    },
    buttonText: {
        ...FONTS.fontMedium,
        fontSize: 16,
        color: COLORS.title,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        margin: 20,
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        maxHeight: '80%',
    },
    modalTitle: {
        ...FONTS.fontMedium,
        fontSize: 20,
        color: COLORS.title,
        marginBottom: 15,
    },
    addressItem: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.primaryLight,
        width: '100%',
        flexDirection: 'row',
    },
    addressTitle: {
        ...FONTS.fontMedium,
        fontSize: 16,
        color: COLORS.title,
    },
    addressText: {
        ...FONTS.fontRegular,
        fontSize: 14,
        color: COLORS.text,
    },
    menuOptions: {
        position: 'absolute',
        right: 30,
        top: 0,
        backgroundColor: 'white',
        borderRadius: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 1000,
    },
    menuOption: {
        padding: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        width: 120,
    },
});
