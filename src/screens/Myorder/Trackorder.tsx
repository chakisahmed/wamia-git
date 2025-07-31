import { useRoute, useTheme } from '@react-navigation/native';
import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, Image, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import Header from '@/layout/Header';
import { COLORS, FONTS } from '@/constants/theme';
import { IMAGES } from '@/constants/Images';
import { GlobalStyleSheet } from '@/constants/StyleSheet';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigation/RootStackParamList';
import Cardstyle3 from '@/components/Card/Cardstyle3';
import { OrderItem } from '@/api/orderApi';
import { t } from 'i18next';
import { getProduct } from '@/api/productsApi';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useCreateRma, useCustomerOrdersRMA, useCustomerRMA } from '@/hooks/rmaHooks';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { notify } from '@/utils/notificationServices';
import { consoleLog } from '@/utils/helpers';


type TrackorderScreenProps = StackScreenProps<RootStackParamList, 'Trackorder'>;

const Trackorder = ({ navigation, route }: TrackorderScreenProps) => {
    const { order } = route.params;




    const theme = useTheme();
    const { colors }: { colors: any } = theme;
    const customerId = useSelector((state: RootState) => state.auth.user?.id); // adjust based on your state structure
    const { orders: rmaEligibleOrders, isLoading: rmaOrdersLoading } = useCustomerOrdersRMA(customerId);
    const [isSubmitting, setIsSubmitting] = useState(false)

    const isOrderEligibleForRMA = rmaEligibleOrders?.some(rmaOrder => rmaOrder.info.includes(order.increment_id));
    const { createRma, createdRma, isLoading: isLoadingCreation, error: creationError } = useCreateRma();
    const { rmas, isLoading, error, refetch } = useCustomerRMA(customerId?.toString());

    // useEffect(()=>{
    //     consoleLog(rmas?.map((i)=> i.orderRef))
    //     consoleLog(rmas?.find((i)=> i.orderRef == "#"+order.increment_id))
    // },[rmas])

    const handleSubmit = () => {
        consoleLog(order.entity_id)
        if (isSubmitting) return;


    
        const payload = {
          order_id: order.entity_id,
          item_ids: [],
          reason_ids:[],
          total_qty:[],
    
          image: [],
          additional_info: "",
          is_checked: true,
          is_virtual: false
    
        }
        //console.log("Submitting RMA:", JSON.stringify(payload));
    
        setIsSubmitting(true)
        //notify(t("submitting_rma"))
    
        createRma(payload).then((_) => {
          setIsSubmitting(false)
          
    
    
          
    
        }).catch((error) => {
            consoleLog(error)
            notify(t("error"))
        }).finally(() => {
          setIsSubmitting(false)
          refetch()
    
        })
      };




    return (
        <ErrorBoundary>
            <View style={{ backgroundColor: colors.backround, flex: 1 }}>
                <Header
                    title={t('track_order')}
                    leftIcon='back'
                    titleRight
                />

                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <View style={[GlobalStyleSheet.container, { paddingTop: 0, marginVertical: 10, paddingBottom: 0 }]}>
                        <View style={{
                            marginHorizontal: -15
                        }}>
                            {order.items.filter((item: OrderItem) => item.price > 0).map((item: OrderItem, index: number) => (
                                <View key={index} style={{ position: 'relative' }}>
                                    <Cardstyle3
                                        data={item}
                                        btntitle={t('track_order')}
                                        brand={item.name}
                                        currency={order.base_currency_code}
                                        offer={t('40%_off')}
                                        onPress={async () => {
                                            const product = await getProduct(item.sku);

                                            if (product) navigation.navigate('ProductsDetails', {
                                                product: product
                                            })
                                            else {
                                                const product = await getProduct(item.sku.split("-")[0]);
                                                navigation.navigate('ProductsDetails', {
                                                    product: product
                                                })
                                            }

                                        }}
                                        removebottom={true}
                                    />
                                    <View style={{ position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.5)', padding: 5, borderRadius: 5 }}>
                                        <Text style={{ color: 'white', ...FONTS.fontMedium }}>{item.qty_ordered}</Text>
                                    </View>
                                </View>
                            ))}

                        </View>
                    </View>
                    <View style={[GlobalStyleSheet.container, { paddingTop: 10, backgroundColor: theme.dark ? 'rgba(255,255,255,.1)' : colors.card, marginTop: 15 }]}>
                        <Text style={{ ...FONTS.fontMedium, fontSize: 16, color: colors.title }}>{t('shipping_address')}</Text>


                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                            <View style={{ height: 40, width: 40, borderWidth: 1, borderColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
                                <Image
                                    style={{ height: 20, width: 20, tintColor: (theme.dark ? COLORS.primaryLight : COLORS.primary), resizeMode: 'contain' }}
                                    source={IMAGES.map}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ ...FONTS.fontMedium, fontSize: 16, color: colors.title }}>{t('delivery_address')}</Text>
                                <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: colors.text }}>{`${order.billing_address.street.join(' ')} ${order.billing_address.city} ${order.billing_address.region} ${order.billing_address.postcode}`}</Text>
                            </View>
                        </View>
                        {/* <Ionicons color={colors.title} name='chevron-forward' size={20}/> */}



                        {/* Choose from list of payment methods from shippingInformation.payment_methods*/}
                        <Text style={{ ...FONTS.fontMedium, fontSize: 16, color: colors.title }}>{t('payment_method')}</Text>

                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                            <View style={{ height: 40, width: 40, borderWidth: 1, borderColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
                                <Image
                                    style={{ height: 20, width: 20, tintColor: (theme.dark ? COLORS.primaryLight : COLORS.primary), resizeMode: 'contain' }}
                                    source={IMAGES.payment}
                                />
                            </View>
                            <View style={{ flex: 1 }}></View>
                            <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: colors.title }}>{order.payment.additional_information[0]}</Text>
                        </View>



                    </View>
                    <View style={[GlobalStyleSheet.container, { paddingTop: 10, backgroundColor: theme.dark ? 'rgba(255,255,255,.1)' : colors.card, marginTop: 15, }]}>
                        <View>
                            <View style={{ borderBottomWidth: 1, borderBottomColor: COLORS.primaryLight, marginHorizontal: -15, paddingHorizontal: 15, paddingBottom: 15, marginTop: 5 }}>
                                <Text style={[FONTS.fontMedium, { fontSize: 16, color: colors.title }]}>{t('price_details')}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5, marginTop: 15 }}>
                                <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: colors.title }}>{`Price (${order?.total_qty_ordered} items)`}</Text>

                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 }}>
                                <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: colors.title }}>{t('items_total')}</Text>
                                <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: COLORS.success }}>{order.subtotal_incl_tax} {order.base_currency_code}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 }}>
                                <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: colors.title }}>{t('delivery_charges')}</Text>
                                <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: COLORS.success }}>{order.shipping_incl_tax} {order.base_currency_code}</Text>
                            </View>
                            <View style={{ borderTopWidth: 1, borderTopColor: COLORS.primaryLight, marginHorizontal: -15, paddingHorizontal: 15, paddingTop: 15, paddingBottom: 5, justifyContent: 'space-between' }}>

                                <View style={{ marginHorizontal: -15, paddingHorizontal: 15, paddingTop: 15, paddingBottom: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Text style={{ ...FONTS.fontRegular, fontSize: 16, color: colors.title }}>{t('total_amount')}</Text>
                                    <Text style={{ ...FONTS.fontRegular, fontSize: 16, color: colors.title }}>{order?.base_grand_total} {order?.base_currency_code}</Text>

                                </View>
                            </View>
                        </View>

                    </View>
                    <View style={[GlobalStyleSheet.container, { paddingTop: 0, backgroundColor: theme.dark ? 'rgba(255,255,255,.1)' : colors.card }]}>
                        <View style={{ marginTop: 15, marginBottom: 20, borderBottomWidth: 1, borderBottomColor: COLORS.primaryLight, marginHorizontal: -15, paddingHorizontal: 15, paddingBottom: 15 }}>
                            <Text style={{ ...FONTS.fontMedium, fontSize: 18, color: colors.title }}>{t('track_order')}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
                            <Image
                                style={{ height: 24, width: 24, resizeMode: 'contain', tintColor: COLORS.primary }}
                                source={IMAGES.check4}
                            />
                            <View style={{ padding: 10, backgroundColor: COLORS.primary, paddingHorizontal: 15, borderRadius: 4 }}>
                                <Text style={{ ...FONTS.fontMedium, fontSize: 16, color: COLORS.card }}>{t("order_placed")}<Text style={{ ...FONTS.fontRegular, fontSize: 14, color: 'rgba(255, 255, 255, 0.50)' }}>   {order.created_at.split(" ")[0]}</Text></Text>
                                <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: COLORS.card }}>{t("we_have_received_your_order")}</Text>
                            </View>
                            <View style={{ height: 70, width: 2, backgroundColor: COLORS.primary, position: 'absolute', left: 11, top: 43 }}></View>
                        </View>
                        {
                            order.status === 'pending' ?
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20, marginTop: 30, marginBottom: 20 }}>
                                    <View style={{ height: 24, width: 24, backgroundColor: COLORS.primaryLight, borderRadius: 24 }}>
                                    </View>
                                    <View style={{ padding: 10, backgroundColor: colors.background, paddingHorizontal: 15, borderRadius: 4 }}>
                                        <Text style={{ ...FONTS.fontMedium, fontSize: 16, color: colors.title }}>{t("we_are_processing_your_order")}</Text>
                                    </View>
                                </View> :
                                order.status === 'pending_payment' ?
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20, marginTop: 30, marginBottom: 20 }}>
                                        <View style={{ height: 24, width: 24, backgroundColor: COLORS.primaryLight, borderRadius: 24 }}>
                                        </View>
                                        <View style={{ padding: 10, backgroundColor: colors.background, paddingHorizontal: 15, borderRadius: 4 }}>
                                            <Text style={{ ...FONTS.fontMedium, fontSize: 16, color: colors.title }}>{t("pending_payment")}</Text>
                                        </View>
                                    </View>

                                    : order.status === 'clictopay_processed' ?
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20, marginTop: 30, marginBottom: 20 }}>
                                            <View style={{ height: 24, width: 24, backgroundColor: COLORS.primary, borderRadius: 24 }}>
                                            </View>
                                            <View style={{ padding: 10, backgroundColor: COLORS.primary, paddingHorizontal: 15, borderRadius: 4 }}>
                                                <Text style={{ ...FONTS.fontMedium, fontSize: 16, color: colors.card }}>{t("clictopay_processed")}</Text>
                                            </View>
                                        </View>




                                        :
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20, marginTop: 30 }}>
                                            <Image
                                                style={{ height: 24, width: 24, resizeMode: 'contain', tintColor: COLORS.primary }}
                                                source={IMAGES.check4}
                                            />
                                            <View style={{ padding: 10, backgroundColor: COLORS.primary, paddingHorizontal: 15, borderRadius: 4 }}>
                                                <Text style={{ ...FONTS.fontMedium, fontSize: 16, color: COLORS.card }}>{t("order_processed")}</Text>
                                            </View>
                                            <View style={{ height: 63, width: 2, backgroundColor: COLORS.primary, position: 'absolute', left: 11, top: 30 }}></View>

                                        </View>
                        }
                        {
                            order.status === 'processing' &&
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20, marginTop: 30, marginBottom: 20 }}>
                                <View style={{ height: 24, width: 24, backgroundColor: COLORS.primaryLight, borderRadius: 24 }}>
                                </View>
                                <View style={{ padding: 10, backgroundColor: colors.background, paddingHorizontal: 15, borderRadius: 4 }}>
                                    <Text style={{ ...FONTS.fontMedium, fontSize: 16, color: colors.title }}>{t("your_order_is_on_the_way")}</Text>
                                </View>
                            </View>
                        }
                        {
                            order.status === 'complete' &&
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20, marginTop: 30, marginBottom: 20 }}>
                                <View style={{ height: 24, width: 24, backgroundColor: COLORS.primaryLight, borderRadius: 24 }}>
                                    <Image
                                        style={{ height: 24, width: 24, resizeMode: 'contain', tintColor: COLORS.primary }}
                                        source={IMAGES.check4}
                                    />
                                </View>
                                <View style={{ padding: 10, backgroundColor: COLORS.primary, paddingHorizontal: 15, borderRadius: 4 }}>
                                    <Text style={{ ...FONTS.fontMedium, fontSize: 16, color: COLORS.card }}>{t("order_has_been_completed")}</Text>
                                </View>
                            </View>
                        }


                        {
                            order.status === 'canceled' &&
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20, marginTop: 30, marginBottom: 20 }}>
                                <View style={{ height: 24, width: 24, backgroundColor: COLORS.primaryLight, borderRadius: 24 }}>
                                </View>
                                <View style={{ padding: 10, backgroundColor: colors.background, paddingHorizontal: 15, borderRadius: 4 }}>
                                    <Text style={{ ...FONTS.fontMedium, fontSize: 16, color: colors.title }}>{t("order_has_been_canceled")}</Text>
                                </View>
                            </View>
                        }

                    </View>

                    <View style={[GlobalStyleSheet.container, { paddingTop: 10, backgroundColor: theme.dark ? 'rgba(255,255,255,.1)' : colors.card, marginTop: 15 }]}>
                        <View style={{ marginTop: 15, marginBottom: 20, borderBottomWidth: 1, borderBottomColor: COLORS.primaryLight, marginHorizontal: -15, paddingHorizontal: 15, paddingBottom: 15 }}>
                            <Text style={{ ...FONTS.fontMedium, fontSize: 18, color: colors.title }}>{t('return_request')}</Text>
                        </View>

                        {isSubmitting?(<ActivityIndicator />):
                        
                        rmaOrdersLoading ? (
                            <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: colors.text }}>{t('checking_eligibility')}</Text>
                        ) : 

                        rmas?.find((i)=> i.orderRef == "#"+order.increment_id) ?(<View style={{ padding: 15, backgroundColor: colors.background, borderRadius: 8, marginBottom: 20 }}>
                                <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: colors.text, textAlign: 'center' }}>
                                    {t('pending_cancellation')}
                                </Text>
                            </View>)
                        
                        
                        :isOrderEligibleForRMA ? (
                            <TouchableOpacity
                                style={{
                                    backgroundColor: COLORS.primary,
                                    padding: 15,
                                    borderRadius: 8,
                                    alignItems: 'center',
                                    marginBottom: 20
                                }}
                                onPress={() => {
                                    // Navigate to RMA creation screen
                                    if (order.status == "pending" || order.status == "processing" ) {
                                        handleSubmit()


                                    }
                                    else
                                        navigation.navigate('CreateRMA', { orderId: order.increment_id });
                                }}
                            >
                                <Text style={{ ...FONTS.fontMedium, fontSize: 16, color: COLORS.card }}>
                                    {order.status == "pending" || order.status == "processing" ? t("cancel_order") : t('request_rma_for_order')}
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={{ padding: 15, backgroundColor: colors.background, borderRadius: 8, marginBottom: 20 }}>
                                <Text style={{ ...FONTS.fontRegular, fontSize: 14, color: colors.text, textAlign: 'center' }}>
                                    {t('order_not_eligible_for_rma')}
                                </Text>
                            </View>
                        )}
                    </View>


                </ScrollView>
            </View></ErrorBoundary>
    )
}

export default Trackorder