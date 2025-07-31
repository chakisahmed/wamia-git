import { useRoute, useTheme } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react'
import { View, Text, ScrollView, Image, TouchableOpacity, TextInput, Modal, ActivityIndicator, StyleSheet } from 'react-native'
import Header from '@/layout/Header';
import { Alert } from 'react-native';
import { IMAGES } from '@/constants/Images';
import { GlobalStyleSheet } from '@/constants/StyleSheet';
import FeatherIcon from 'react-native-vector-icons/Feather';
//import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '@/constants/theme';
import Button from '@/components/Button/Button';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigation/RootStackParamList';
import { createOrder, getOrderById } from '@/api/orderApi';
import { CartItem as CartItemType, CartResponse } from '@/api/cartApi';
import { AddressInformation, postShippingInformation, ShippingInformationResponse } from '@/api/shippingInformationApi';
import { useDispatch, useSelector } from 'react-redux';
import { estimateShippingMethods, ShippingMethod } from '@/api/shippingMethodsApi';
import { useTranslation } from 'react-i18next';
import { t } from 'i18next';
import SuccessModal from '@/components/Modal/SuccessModal';
import LoadingModal from '@/components/Modal/LoadingModal';
import { ClictoPayApi } from '@/api/clictoPayApi';
import { clearCart } from '@/redux/slices/cartSlice';
import i18n from '@/utils/i18n';
import { Linking } from 'react-native';
import { applyCouponCode, removeCouponCode } from '@/api/couponApi';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import ErrorComponent from '../Components/ErrorComponent';
import { RootState } from '@/redux/store';





type CheckoutScreenProps = StackScreenProps<RootStackParamList, 'Checkout'>;
const CartItem = ({ item, shippingInformation }: { item: CartItemType, shippingInformation: ShippingInformationResponse }) => {
    const theme = useTheme();
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
            {/* <Image source={{ uri: item.image.replace('localhost','192.168.1.16') }} style={{ width: 50, height: 50, marginRight: 10 }} /> */}
            <View style={{ flex: 1 }}>
                <Text style={{ ...FONTS.fontMedium, fontSize: 16, color: (theme.dark ? COLORS.primaryLight : COLORS.primary) }}>{item.name}</Text>
                <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: COLORS.text }}>{t("quantity")}: {item.qty}</Text>

                <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: COLORS.text }}>
                    {(item.price * item.qty) + " " + shippingInformation.totals?.base_currency_code}
                </Text>


            </View>
        </View>
    )
};
const Checkout = ({ navigation }: CheckoutScreenProps) => {
    const {user, userToken} = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();
    const route = useRoute();
    const { details } = useSelector((state: RootState) => state.cart);
        const {  addresses } = route.params as {  addresses: AddressInformation };

    
    const [modalVisible, setModalVisible] = useState(false);
    const [activeSheet, setActiveSheet] = useState('');
    const [total, setTotal] = useState<number>(0);
    const [totalFormatted, setTotalFormatted] = useState<string>('');
    const theme = useTheme();
    const { colors }: { colors: any } = theme;
    const [shippingInformation, setShippingInformation] = useState<ShippingInformationResponse>();
    const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
    const [selectedShippingMethod, setSelectedShippingMethod] = useState<ShippingMethod>();
    const [paymentMethod, setPaymentMethod] = useState({ code: '', title: '' });
    const [paymentError, setPaymentError] = useState("")
    const { t } = useTranslation();

    // A AJOUTER : États pour la soumission et les erreurs de chargement
    const [isLoading, setIsLoading] = useState(true); // Gère le chargement initial des données
    const [loadError, setLoadError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false); // Gère la soumission de la commande


    // =================== 2. ADD STATE FOR COUPON HANDLING ===================
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
    const [isCouponLoading, setIsCouponLoading] = useState(false);
    const [couponMessage, setCouponMessage] = useState({ text: '', type: 'error' });

    // Using a ref to check if component is mounted to prevent state updates on unmounted component
    const controller = useRef(new AbortController());

    const loadShippingInformation = async (selectedMethod: ShippingMethod) => {
        const shippingInformationPost = {
            addressInformation: {
                shipping_address: addresses.shipping,
                billing_address: addresses.billing,
                shipping_carrier_code: selectedMethod?.carrier_code || 'flatrate',
                shipping_method_code: selectedMethod?.method_code || 'flatrate',
            }
        };
        const response = await postShippingInformation(shippingInformationPost as AddressInformation);
        if (!controller.current.signal.aborted) {
            setShippingInformation(response);
        }
    };

    const loadInitialData = async (controller:AbortController) => {
    if (controller.signal.aborted) return;

    setIsLoading(true);
    setLoadError(null);

    try {
        const methods = await estimateShippingMethods(addresses.shipping);
        if (!controller.signal.aborted) {
            if (methods && methods.length > 0) {
                setShippingMethods(methods);
                setSelectedShippingMethod(methods[0]);
                await loadShippingInformation(methods[0]);
            } else {
                throw new Error(t('no_shipping_methods_available'));
            }
        }
    } catch (error: any) {
        console.error("Failed to load checkout data:", error);
        if (!controller.signal.aborted) {
            setLoadError(error.message || t('error_loading_shipping_methods'));
        }
    } finally {
        if (!controller.signal.aborted) {
            setIsLoading(false);
        }
    }
};

useEffect(() => {
  // Annuler la requête précédente, le cas échéant
  controller.current?.abort();

  // Repartir sur un contrôleur neuf
  controller.current = new AbortController();

  loadInitialData(controller.current);   // passez-le à la requête

  return () => {
    controller.current?.abort();
  };
}, [addresses]);

const handleRetry = () => {
    loadInitialData();
};

useEffect(()=>{
    try {
        if(shippingInformation?.payment_methods){

            const data= shippingInformation.payment_methods.find((v)=>v.code == "cashondelivery")
            if(data)
            setPaymentMethod({code:data.code,title:data.title})
        }
    } catch (error) {
        
    }
},[shippingInformation])


    // =================== 4. HANDLERS FOR APPLYING/REMOVING COUPON ===================


    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            setCouponMessage({ text: t('please_enter_coupon'), type: 'error' });
            return;
        }
        setIsCouponLoading(true);
        setCouponMessage({ text: '', type: 'error' });
        try {
            await applyCouponCode(couponCode);
            if (!controller.current.signal.aborted) {
                setAppliedCoupon(couponCode);
                setCouponMessage({ text: t('coupon_applied_success'), type: 'success' });
                // Refresh totals to show the discount
                if (selectedShippingMethod) {
                    await loadShippingInformation(selectedShippingMethod);
                }
            }
        } catch (error: any) {
            if (!controller.current.signal.aborted) {
                setCouponMessage({ text: error.message || t('invalid_coupon_code'), type: 'error' });
            }
        } finally {
            if (!controller.current.signal.aborted) {
                setIsCouponLoading(false);
            }
        }
    };

    const handleRemoveCoupon = async () => {
        setIsCouponLoading(true);
        setCouponMessage({ text: '', type: 'error' });
        try {
            await removeCouponCode();
            if (!controller.current.signal.aborted) {
                setAppliedCoupon(null);
                setCouponCode(''); // Clear the input
                setCouponMessage({ text: t('coupon_removed_success'), type: 'success' });
                // Refresh totals to remove the discount
                if (selectedShippingMethod) {
                    await loadShippingInformation(selectedShippingMethod);
                }
            }
        } catch (error: any) {
            if (!controller.current.signal.aborted) {
                setCouponMessage({ text: error.message || t('coupon_removal_failed'), type: 'error' });
            }
        } finally {
            if (!controller.current.signal.aborted) {
                setIsCouponLoading(false);
            }
        }
    };



    // A MODIFIER : La fonction handleSubmitOrder
    async function handleSubmitOrder(): Promise<void> {
        if (isSubmitting) return; // Empêche les soumissions multiples
        if(paymentMethod.code==''){
            Alert.alert(t("payment_method_not_selected"),t("select_payment_method"))
            return;

        }

        setIsSubmitting(true);
        setModalVisible(true);
        setActiveSheet('loading');

        

        

        try {
            const payload = {
                paymentMethod: {
                    method: paymentMethod.code,
                },
                billing_address: addresses.billing,
                email: addresses.billing.email,
                token:userToken,
                customer:user
                
            };

            const orderId = await createOrder(payload);
            const orderDetails = await getOrderById(orderId);
            const incrementalId = orderDetails.increment_id;

            // Si le paiement est externe (ClictoPay) (disabled)
            if (payload.paymentMethod.method === "clictopay_gateway") {
                const credentials = { userName: "", password: "" };
                const clictoPay = new ClictoPayApi(credentials);
                const defaultLanguage = i18n.language;

                const response = await clictoPay.registerPayment({
                    amount: (shippingInformation?.totals?.base_subtotal_with_discount + selectedShippingMethod?.amount) * 1000, // Utilisez le total avec réduction
                    currency: 788,
                    language: defaultLanguage,
                    returnUrl: 'https://www.wamia.tn/clictopay/checkout/success',
                    orderNumber: incrementalId
                });

                // Vider le panier SEULEMENT après avoir obtenu l'URL de paiement
                // Cela réduit le risque de perdre le panier si la création du paiement échoue
                dispatch(clearCart({callApi:false, token:userToken}));

                // Tenter d'ouvrir le lien de paiement
                await Linking.openURL(response.formUrl);

                // Ne pas afficher le succès immédiatement, car l'utilisateur est redirigé.
                // La gestion du succès devrait idéalement se faire au retour dans l'app.
                // Pour l'instant, on laisse le modal de chargement actif un court instant puis on ferme.
                setTimeout(() => {
                    if (!controller.current.signal.aborted) {
                        setModalVisible(false);
                        // On ne navigue pas vers 'Myorder' car on ne sait pas si le paiement a réussi
                    }
                }, 3000);

            } else {
                // Pour les paiements directs (ex: paiement à la livraison)
                dispatch(clearCart({callApi:false, token:userToken}));
                if (!controller.current.signal.aborted) {
                    setActiveSheet('success');
                }
            }

        } catch (error) {
            console.error('Order submission failed:', error.response?.data || error);
            if (!controller.current.signal.aborted) {
                setModalVisible(false); // Fermer le modal de chargement
            }
            Alert.alert(
                t("order_failed"),
                t("order_failure_message"),
                [{ text: "OK" }]
            );
        } finally {
            // S'assurer que le bouton est réactivé, que ça réussisse ou non
            if (!controller.current.signal.aborted) {
                setIsSubmitting(false);
            }
        }
    }
    const shipping = addresses.shipping;
    const billing = addresses.billing;

    return (
        <ErrorBoundary>
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

                            if (activeSheet == "success") {
                                setModalVisible(false)
                                navigation.navigate('Myorder')
                            }
                        }}
                        style={{

                            position: 'absolute',
                            height: '100%',
                            width: '100%',
                            backgroundColor: 'rgba(0,0,0,.3)',
                        }}
                    />

                    {activeSheet == "loading" && <LoadingModal title={t("processing_order")} message={t("processing_order_message")} />}
                    {activeSheet == "success" && <SuccessModal title={t("congratulations")} message={t("order_placed_successfully")} />}

                </View>
            </Modal>
            <View style={{ backgroundColor: colors.background, flex: 1 }}>
                <Header
                    title={t('checkout')}
                    leftIcon='back'
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
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                            <View style={{ height: 18, width: 18, borderRadius: 30, backgroundColor: theme.dark ? 'orange' : COLORS.primary, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={[FONTS.fontMedium, { fontSize: 10, color: COLORS.card }]}>1</Text>
                            </View>
                            <Text style={[FONTS.fontMedium, { fontSize: 13, color: theme.dark ? 'orange' : colors.title }]}>{t('cart')}</Text>
                        </View>
                        <View style={{ height: 2, flex: 1, backgroundColor: theme.dark ? 'orange' : COLORS.primary, marginHorizontal: 10 }} />
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                            <View style={{ height: 18, width: 18, borderRadius: 30, backgroundColor: theme.dark ? 'orange' : COLORS.primary, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={[FONTS.fontMedium, { fontSize: 10, color: COLORS.card }]}>2</Text>
                            </View>
                            <Text style={[FONTS.fontMedium, { fontSize: 13, color: theme.dark ? 'orange' : colors.title }]}>{t('address')}</Text>
                        </View>
                        <View style={{ height: 2, flex: 1, backgroundColor: theme.dark ? 'orange' : COLORS.primary, marginHorizontal: 10 }} />
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                            <View style={{ height: 18, width: 18, borderRadius: 30, backgroundColor: theme.dark ? 'orange' : COLORS.primary, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={[FONTS.fontMedium, { fontSize: 10, color: COLORS.card }]}>3</Text>
                            </View>
                            <Text style={[FONTS.fontMedium, { fontSize: 13, color: theme.dark ? 'orange' : colors.title }]}>{t('payment')}</Text>
                        </View>
                    </View>
                </View>
                {isLoading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : loadError ? (
                <ErrorComponent message={loadError} onRetry={handleRetry} />
            ) :
                    
                    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    

                    {/* =================== 5. COUPON UI SECTION =================== */}
                    (<>

                        <View style={[GlobalStyleSheet.container, { paddingTop: 10, backgroundColor: theme.dark ? 'rgba(255,255,255,.1)' : colors.card, marginTop: 15 }]}>
                            <Text style={{ ...FONTS.fontMedium, fontSize: 16, color: colors.title }}>{t("shipping_address")}</Text>

                            <TouchableOpacity
                                onPress={() => navigation.navigate('DeliveryAddress')}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    borderBottomWidth: 1,
                                    marginHorizontal: -15,
                                    paddingHorizontal: 15,
                                    borderBottomColor: COLORS.primaryLight,
                                    paddingBottom: 10,
                                    marginTop: 10
                                }}

                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                                    <View style={{ height: 40, width: 40, borderWidth: 1, borderColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
                                        <Image
                                            style={{ height: 20, width: 20, tintColor: (theme.dark ? COLORS.primaryLight : COLORS.primary), resizeMode: 'contain' }}
                                            source={IMAGES.map}
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ ...FONTS.fontMedium, fontSize: 16, color: colors.title }}>{t("delivery_address")}</Text>
                                        <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: colors.text }}>{`${shipping.street.join(' ')} ${shipping.city} ${shipping.region.region ?? shipping.region} ${shipping.postcode}`}</Text>
                                    </View>
                                </View>
                                <FeatherIcon size={22} color={colors.title} name={'chevron-right'} />
                                {/* <Ionicons color={colors.title} name='chevron-forward' size={20}/> */}
                            </TouchableOpacity>

                            <Text style={{ ...FONTS.fontMedium, fontSize: 16, color: colors.title }}>{t("billing_address")}</Text>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('DeliveryAddress')}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    borderBottomWidth: 1,
                                    marginHorizontal: -15,
                                    paddingHorizontal: 15,
                                    borderBottomColor: COLORS.primaryLight,
                                    paddingBottom: 10,
                                    marginTop: 10
                                }}

                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                                    <View style={{ height: 40, width: 40, borderWidth: 1, borderColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
                                        <Image
                                            style={{ height: 20, width: 20, tintColor: (theme.dark ? COLORS.primaryLight : COLORS.primary), resizeMode: 'contain' }}
                                            source={IMAGES.map}
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ ...FONTS.fontMedium, fontSize: 16, color: colors.title }}>{t("delivery_address")}</Text>
                                        <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: colors.text }}>{`${billing.street.join(' ')} ${billing.city} ${billing.region.region ?? billing.region} ${billing.postcode}`}</Text>
                                    </View>
                                </View>
                                <FeatherIcon size={22} color={colors.title} name={'chevron-right'} />
                                {/* <Ionicons color={colors.title} name='chevron-forward' size={20}/> */}
                            </TouchableOpacity>

                            {/* Choose from list of shipping methods from shippingMethods*/}
                            <Text style={{ ...FONTS.fontMedium, fontSize: 16, color: colors.title, marginTop: 10, paddingBottom: 10 }}>{t("shipping_method")}</Text>
                            {shippingMethods.map((method, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => {
                                        loadShippingInformation(method);
                                        setSelectedShippingMethod(method);
                                    }}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        borderBottomWidth: 1,
                                        marginHorizontal: -15,
                                        paddingHorizontal: 15,
                                        borderBottomColor: COLORS.primaryLight,
                                        paddingVertical: 10,
                                        backgroundColor: selectedShippingMethod?.method_code === method.method_code ? (theme.dark ? COLORS.primary : COLORS.primaryLight) : 'transparent'
                                    }}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                                        <View style={{ height: 40, width: 40, borderWidth: 1, borderColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
                                            <Image
                                                style={{ height: 20, width: 20, tintColor: (theme.dark ? COLORS.primaryLight : COLORS.primary), resizeMode: 'contain' }}
                                                source={IMAGES.deliverytruck}
                                            />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: colors.title }}>{method.method_title}</Text>
                                            <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: colors.text }}>{method.carrier_title}</Text>
                                        </View>
                                    </View>
                                    <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: colors.title }}>{method.amount} {shippingInformation?.totals?.base_currency_code}</Text>
                                </TouchableOpacity>
                            ))}


                            {/* Choose from list of payment methods from shippingInformation.payment_methods*/}
                            <Text style={{ ...FONTS.fontMedium, fontSize: 16, color: colors.title, marginTop: 10, paddingBottom: 10 }}>{t("payment_method")}</Text>
                            {shippingInformation?.payment_methods?.map((method, index) => {
                                console.log(method.code)
                                return (
                                method.code !== 'clictopay_gateway' && <TouchableOpacity
                                    key={index}
                                    onPress={() => setPaymentMethod(method)}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        borderBottomWidth: 1,
                                        marginHorizontal: -15,
                                        paddingHorizontal: 15,
                                        borderBottomColor: COLORS.primaryLight,
                                        paddingVertical: 10,
                                        backgroundColor: paymentMethod.code === method.code ? (theme.dark ? COLORS.primary : COLORS.primaryLight) : 'transparent'
                                    }}  
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                                        <View style={{ height: 40, width: 40, borderWidth: 1, borderColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
                                            <Image
                                                style={{ height: 20, width: 20, tintColor: (theme.dark ? COLORS.primaryLight : COLORS.primary), resizeMode: 'contain' }}
                                                source={IMAGES.payment}
                                            />
                                        </View>
                                        <View style={{ flex: 1 }}></View>
                                        <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: colors.title }}>{method.title}</Text>
                                    </View>

                                </TouchableOpacity>
                            )})}



                            {/* <View style={{ marginTop: 20, }}>
                        <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title }}>Additional Notes:</Text>
                        <TextInput
                            style={{
                                ...FONTS.fontRegular,
                                fontSize: 15,
                                color: colors.title,
                                //paddingVertical: 12,
                                //paddingHorizontal: 15,
                                borderBottomWidth: 2,
                                borderBottomColor: COLORS.primaryLight,
                                //height: 60,
                                paddingBottom: 50,
                                // width: '100%',
                            }}
                            placeholder='Write Here'
                            multiline
                            placeholderTextColor={colors.text}
                        />
                    </View> */}
                        </View>
                        <View style={{ flex: 1 }}></View>
                        <View style={[styles.card, { backgroundColor: theme.dark ? 'rgba(255,255,255,.1)' : colors.card }]}>
                            <Text style={[FONTS.fontMedium, { fontSize: 16, color: colors.title, marginBottom: 10 }]}>{t("have_a_coupon")}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <TextInput
                                    style={[styles.couponInput, { color: colors.title, borderColor: COLORS.primaryLight, flex: 1 }]}
                                    placeholder={t("enter_coupon_code")}
                                    placeholderTextColor={colors.text}
                                    value={couponCode}
                                    onChangeText={setCouponCode}
                                    editable={!appliedCoupon && !isCouponLoading}
                                />
                                {isCouponLoading ? (
                                    <ActivityIndicator color={COLORS.primary} style={{ marginLeft: 10 }} />
                                ) : (
                                    <TouchableOpacity
                                        onPress={appliedCoupon ? handleRemoveCoupon : handleApplyCoupon}
                                        style={[styles.couponButton, { backgroundColor: appliedCoupon ? COLORS.danger : COLORS.primary }]}
                                    >
                                        <Text style={{ ...FONTS.fontMedium, color: COLORS.white }}>
                                            {appliedCoupon ? t('remove') : t('apply')}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                            {couponMessage.text ? (
                                <Text style={{ ...FONTS.fontRegular, color: couponMessage.type === 'success' ? COLORS.success : COLORS.danger, marginTop: 8 }}>
                                    {couponMessage.text}
                                </Text>
                            ) : null}
                        </View>
                        {shippingInformation != null && <View style={[GlobalStyleSheet.container, { paddingTop: 10, backgroundColor: theme.dark ? 'rgba(255,255,255,.1)' : colors.card, marginTop: 15, }]}>
                            {details?.items.map((item, index) => (
                                <CartItem key={index} item={item} shippingInformation={shippingInformation} />
                            ))}
                        </View>}
                        <View style={[GlobalStyleSheet.container, { paddingTop: 10, backgroundColor: theme.dark ? 'rgba(255,255,255,.1)' : colors.card, marginTop: 15, }]}>
                            <View>
                                <View style={{ borderBottomWidth: 1, borderBottomColor: COLORS.primaryLight, marginHorizontal: -15, paddingHorizontal: 15, paddingBottom: 15, marginTop: 5 }}>
                                    <Text style={[FONTS.fontMedium, { fontSize: 16, color: colors.title }]}>{t("price_details")}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5, marginTop: 15 }}>
                                    <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: colors.title }}>{t("price")} ({shippingInformation?.totals?.items_qty} {t("items")})</Text>
                                    {/**calculate total of final_price from cartData */}
                                    <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: colors.title }}>
                                        {totalFormatted}

                                    </Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 }}>
                                    <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: colors.title }}>{t("items_total")}</Text>
                                    <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: COLORS.success }}>{shippingInformation?.totals?.base_subtotal} {shippingInformation?.totals?.base_currency_code}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 }}>
                                    <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: colors.title }}>{t("delivery_charges")}</Text>
                                    <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: COLORS.success }}>{selectedShippingMethod?.amount} {shippingInformation?.totals?.base_currency_code}</Text>
                                </View>
                                <View style={{ borderTopWidth: 1, borderTopColor: COLORS.primaryLight, marginHorizontal: -15, paddingHorizontal: 15, paddingTop: 15, paddingBottom: 5, justifyContent: 'space-between' }}>

                                    <View style={{ marginHorizontal: -15, paddingHorizontal: 15, paddingTop: 15, paddingBottom: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Text style={{ ...FONTS.fontRegular, fontSize: 16, color: colors.title }}>{t("total_amount")}</Text>
                                        <Text style={{ ...FONTS.fontRegular, fontSize: 16, color: colors.title }}>{(shippingInformation?.totals?.base_subtotal + selectedShippingMethod?.amount)} {shippingInformation?.totals?.base_currency_code}</Text>

                                    </View>
                                </View>
                            </View>

                        </View>
                        <View style={[GlobalStyleSheet.container, { paddingHorizontal: 0, paddingBottom: 0 }]}>
                            <View style={[GlobalStyleSheet.container, { paddingHorizontal: 0, paddingBottom: 0 }]}>
                                <View style={{ height: 88, width: '100%', backgroundColor: theme.dark ? 'rgba(255,255,255,.1)' : colors.card, justifyContent: 'center', paddingHorizontal: 15 }}>
                                    <Button
                                        title={isSubmitting ? t('processing...') : t('submit_order')}
                                        color={COLORS.secondary}
                                        text={COLORS.title}
                                        onPress={handleSubmitOrder}
                                        disabled={isSubmitting || !!loadError} 
                                    />
                                </View>
                            </View>
                        </View></>)
                </ScrollView>}
            </View>
        </ErrorBoundary>
    )
}

export default Checkout
// ============== 7. ADD STYLES FOR NEW ELEMENTS ===============
const styles = StyleSheet.create({
    modalContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        position: 'relative',
    },
    modalBackdrop: {
        position: 'absolute',
        height: '100%',
        width: '100%',
        backgroundColor: 'rgba(0,0,0,.3)',
    },
    card: {
        ...GlobalStyleSheet.container,
        paddingTop: 10,
        marginTop: 15,
    },
    couponInput: {
        ...FONTS.fontRegular,
        fontSize: 15,
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 15,
        height: 48,
    },
    couponButton: {
        paddingHorizontal: 20,
        height: 48,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
    },
    priceSectionHeader: {
        borderBottomWidth: 1,
        borderBottomColor: COLORS.primaryLight,
        marginHorizontal: -15,
        paddingHorizontal: 15,
        paddingBottom: 15,
        marginTop: 5,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        marginTop: 10,
    },
    priceLabel: (colors: any) => ({
        ...FONTS.fontRegular,
        fontSize: 14,
        color: colors.title,
    }),
    priceValue: (colors: any) => ({
        ...FONTS.fontRegular,
        fontSize: 14,
        color: colors.title,
    }),
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: COLORS.primaryLight,
        marginHorizontal: -15,
        paddingHorizontal: 15,
        paddingTop: 15,
        marginTop: 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 0,
        paddingBottom: 0,
    },
    footerContent: {
        height: 88,
        width: '100%',
        justifyContent: 'center',
        paddingHorizontal: 15,
        borderTopWidth: 1,
        borderColor: COLORS.primaryLight
    }
});


