import React, { useEffect, useState } from 'react'
import { View, Text, SafeAreaView, TouchableOpacity, Image, ScrollView, StatusBar, Modal } from 'react-native'
import { COLORS, FONTS, SIZES } from '@/constants/theme'
import { GlobalStyleSheet } from '@/constants/StyleSheet'
import { useRoute, useTheme } from '@react-navigation/native'
import { Feather } from '@expo/vector-icons';
//import FeatherIcon from 'react-native-vector-icons/Feather';
import { StackScreenProps } from '@react-navigation/stack'
import { RootStackParamList } from '@/navigation/RootStackParamList'
import Input from '@/components/Input/Input'
import { IMAGES } from '@/constants/Images'
import Button from '@/components/Button/Button'
import OTPInput from '@/components/Input/OTPInput'
import { t } from 'i18next'
//import OTPInputView from '@twotalltotems/react-native-otp-input'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import LoadingModal from '@/components/Modal/LoadingModal'
import SuccessModal from '@/components/Modal/SuccessModal'
import ErrorModal from '@/components/Modal/ErrorModal'
import { ErrorBoundary } from '@/components/ErrorBoundary'
type OTPAuthenticationScreenProps = StackScreenProps<RootStackParamList, 'OTPAuthentication'>;

const OTPAuthentication = ({ navigation, route }: OTPAuthenticationScreenProps) => {

    const { phone, country } = route.params

    const theme = useTheme();
    const { colors }: { colors: any } = theme;

    const [otpCode, setOTPCode] = useState("");
    const [isPinReady, setIsPinReady] = useState(false);
    const maximumCodeLength = 6;
    useEffect(() => {
    }, [])
    const [modalVisible, setModalVisible] = useState(false)
    const [successModal, setSuccessModal] = useState<any>(null)
    useEffect(() => {
        setModalVisible(false)
    }, [])


    function handleContinue(): void {


        setModalVisible(true)
        setTimeout(() => {
            setSuccessModal(true);
            setTimeout(() => {
                setModalVisible(false)
                navigation.navigate("SignUp")
            }, 1000);
        }, 3000);

        //navigation.navigate("SignUp")


    }

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

                            if (successModal != null) {
                                setSuccessModal(null)
                                setModalVisible(true)
                                //navigation.navigate('Myorder')
                            }
                        }}
                        style={{

                            position: 'absolute',
                            height: '100%',
                            width: '100%',
                            backgroundColor: 'rgba(0,0,0,.3)',
                        }}
                    />

                    {successModal == true ? <SuccessModal title={t('success')} /> :
                        successModal == false ? <ErrorModal title={t('error')} message={t('invalid_code')} /> :
                            <LoadingModal title={t('verifying')} message={t('verifying_the_code')} />}
                </View>
            </Modal>
            <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.primary }}>

                <KeyboardAwareScrollView
                    contentContainerStyle={{ height: "100%" }} // add paddingBottom for button space
                    enableOnAndroid
                    extraScrollHeight={0}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={[GlobalStyleSheet.container, { paddingVertical: 20 }]}>
                        <View style={[GlobalStyleSheet.row, { alignItems: 'center', justifyContent: 'space-between' }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <TouchableOpacity
                                    onPress={() => navigation.goBack()}
                                //style={[styles.actionBtn,{}]}
                                >
                                    <Feather size={24} color={COLORS.card} name={'arrow-left'} />
                                </TouchableOpacity>
                                <Text style={[FONTS.fontMedium, { fontSize: 20, color: COLORS.card }]}>OTP</Text>
                            </View>
                            {/* <TouchableOpacity>
                    <Text style={[FONTS.fontRegular,{fontSize:16,color:colors.card,textDecorationLine:'underline'}]}>Skip</Text>
                </TouchableOpacity> */}
                        </View>
                    </View>
                    <View style={{ flex: 1, backgroundColor: theme.dark ? colors.background : colors.card, borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
                        <View style={[GlobalStyleSheet.container, { flexGrow: 1, marginTop: 15 }]}>
                            <ScrollView>
                                <Text style={[FONTS.fontMedium, { fontSize: 18, color: colors.title, }]}>{t("please_enter_otp")}</Text>
                                <Text style={[FONTS.fontMedium, { fontSize: 18, color: COLORS.primary }]}> +{country.dial_code} {phone} </Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 15 }}>
                                    <Text style={[FONTS.fontMedium, { fontSize: 14, color: colors.text }]}>{t("enter_otp")}</Text>
                                </View>
                                <View>
                                    <View style={{ marginBottom: 20 }}>
                                        <OTPInput
                                            code={otpCode}
                                            setCode={setOTPCode}
                                            maximumLength={maximumCodeLength}
                                            setIsPinReady={setIsPinReady}
                                        />
                                        {/* <StatusBar barStyle={'light-content'}/> */}
                                    </View>
                                </View>
                                <TouchableOpacity style={{ paddingTop: 0 }}>
                                    <Text style={[FONTS.fontMedium, { fontSize: 12, color: COLORS.primary, textAlign: 'right' }]}>{t("resend_otp")}</Text>
                                </TouchableOpacity>
                            </ScrollView>
                            <TouchableOpacity onPress={() => handleContinue()} style={
                                {
                                    borderRadius: 10,
                                    marginBottom: 80,
                                    alignItems: 'center',
                                    justifyContent: "center",
                                    backgroundColor: (otpCode && otpCode.length == 6) ?
                                        COLORS.secondary : (theme.dark ? COLORS.dark : COLORS.lightGray)
                                }} disabled={!(otpCode && otpCode.length == 6)}>
                                <Text style={[FONTS.fontMedium, {
                                    padding: 20, fontSize: 20,
                                    color: (otpCode && otpCode.length == 6) ? 'black' :
                                        (theme.dark ? COLORS.darkBackground : COLORS.primaryLight)
                                }]}>


                                    {t("continue")}



                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAwareScrollView>
            </SafeAreaView>
        </ErrorBoundary>
    )
}

export default OTPAuthentication