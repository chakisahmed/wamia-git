import { View, Text, SafeAreaView, TouchableOpacity, Image, ScrollView, Dimensions, Alert } from 'react-native'
import React, { useState } from 'react'
import { COLORS, FONTS } from '@/constants/theme'
import { GlobalStyleSheet } from '@/constants/StyleSheet'
import { CommonActions, useRoute, useTheme } from '@react-navigation/native'
import { Feather } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack'
import { RootStackParamList } from '@/navigation/RootStackParamList'
import Input from '@/components/Input/Input'
import Button from '@/components/Button/Button'
import SelectCountery from '@/components/SelectCountery'
import { t } from 'i18next'
import { IMAGES } from '@/constants/Images'
import AnimatedGradientBackground from '../Components/AnimatedGradientBackground'
import { facebookLogin, googleSignIn } from '@/utils/sociallogins'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getCustomerDetails } from '@/api/customerApi'
import { getApolloClient } from '@/api/apolloClient'
import { setUser, setUserToken } from '@/redux/slices/authSlice'
import { useDispatch } from 'react-redux'
import { fetchCartItems } from '@/redux/slices/cartSlice'
import { fetchWishlist } from '@/redux/slices/wishListSlice'
import { assignGuestCartToCustomer, getCart } from '@/api/cartApi'
import * as Keychain from 'react-native-keychain';
import { ErrorBoundary } from '@/components/ErrorBoundary'
import SignIn from './SignIn'

type SignInPhoneScreenProps = StackScreenProps<RootStackParamList, 'SignInPhone'>;

const SignInPhone = ({ navigation }: SignInPhoneScreenProps) => {

  const route = useRoute();
  const params = route.params; 
  const { redirectTo }: { redirectTo?: string } = params != null ? params : { redirectTo: '' };

  const dispatch = useDispatch()

  const theme = useTheme();
  const { colors }: { colors: any } = theme;
  const SCREEN_WIDTH = Dimensions.get('window').width;

  const [loading, setLoading] = useState(false)

  const [emailMode, setEmailMode] = useState(false)

  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("")

  const [country, setCountry] = useState({ flag: 'TN', dial_code: '216', code: 'TN', name: 'Tunisia' });

  const handleChange = (text: any) => {
    setPhoneError("")
    const numericValue = text.replace(/[^0-9]/g, "");
    setPhone(numericValue);
  };
  const gradientColorSets: [string[], string[]] = [
    [COLORS.primary, COLORS.primary_100], // Sunrise state
    [COLORS.secondary_100, COLORS.primary], // Day state
  ];

  const handleLogin = async (token: any) => {



    if (!loading) {
      setLoading(true);
      try {



        const response = token;
        const customer = await getCustomerDetails();

        dispatch(fetchCartItems());
        // navigation.navigate('DrawerNavigation', { screen: 'Home' });

        const client = getApolloClient();

        await client.clearStore();
        dispatch(setUserToken(response));
        dispatch(setUser(customer))
        dispatch(fetchWishlist());
        if (redirectTo != '') {
          const response1 = await assignGuestCartToCustomer(customer);
          if (response1) {
            const cart = await getCart();
            navigation.navigate(redirectTo, {
              cart, addresses: {
                billing: customer.addresses.find(address => address.default_billing),
                shipping: customer.addresses.find(address => address.default_shipping)
              }
            });
          }
        } else
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                { name: 'DrawerNavigation', params: { screen: 'Home' } },
              ],
            })
          );




      } catch (error) {
        Alert.alert('Login Failed', error.status == 401 ? t("invalid_email_or_password") : t('something_went_wrong'));
      }
      setLoading(false);
    }
  };

  function handleContinue(): void {
    if (!phone) {
      setPhoneError(t("phone_number_required"))
      return

    }

    navigation.navigate('OTPAuthentication',

      { phone, country })
  }

  return (
    <ErrorBoundary>


      {emailMode? (<SignIn navigation={navigation} route={route}/>):(<SafeAreaView style={{ flex: 1, backgroundColor: COLORS.primary }}>
        <AnimatedGradientBackground
          colorSets={gradientColorSets}
          style={[GlobalStyleSheet.container, { paddingVertical: 20, height: 300 }]}
        >
          {/* All the content that was inside the gradient is now a child of our new component */}
          <View style={[GlobalStyleSheet.row, { alignItems: 'center', justifyContent: 'space-between' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
              >
                <Feather size={24} color={COLORS.card} name={'arrow-left'} />
              </TouchableOpacity>
              <Text style={[FONTS.fontMedium, { fontSize: 20, color: COLORS.card }]}>{t("login")}</Text>
            </View>
          </View>
          <View style={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Image source={IMAGES.wamia_logo_white} style={{
              width: SCREEN_WIDTH * 4 / 5,
              height: 200,
            }} resizeMode='contain' />
          </View>
        </AnimatedGradientBackground>
        <View style={{ flex: 1, backgroundColor: theme.dark ? colors.background : COLORS.card, borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
          <View style={[GlobalStyleSheet.container, { flexGrow: 1, marginTop: 15 }]}>
            <ScrollView>
              <Text style={[FONTS.fontMedium, { fontSize: 18, color: colors.title, }]}>{t("welcome")}</Text>
              <Text style={[FONTS.fontRegular, { fontSize: 14, color: colors.text, }]}>{t('lets_start_with_phone_number')}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 15, paddingBottom: 5 }}>

                <Text style={[FONTS.fontMedium, { fontSize: 14, color: phoneError ? COLORS.danger : COLORS.primary }]}>{t("phone_number")}</Text>
                
              </View>

              <View>
                <Input
                  inputBorder
                  value={phone}
                  onChangeText={(value) => handleChange(value)}
                  keyboardType={'number-pad'}
                  style={{ borderColor: phoneError ? COLORS.danger : COLORS.primary, paddingLeft: 70 }}

                />
                <View style={{ position: 'absolute', top: 12, left: 0 }}>
                  <SelectCountery onSelect={function (country: { code: string; dial_code: string }): void {
                    setCountry(country)

                  }} />
                </View>
              </View>
              {phoneError &&
                <View style={{ paddingTop: 10 }}>
                  <Text style={[FONTS.fontRegular, { fontSize: 14, color: COLORS.danger }]}>{phoneError}</Text>
                </View>

              }
              {/* <View style={{paddingTop:10}}>
                        <Text style={[FONTS.fontRegular,{fontSize:14,color:colors.title}]}>By continuing, you agree to ClickCart's <Text style={[FONTS.fontSemiBold,{color:COLORS.primary}]}>Terms of Use</Text>{"\n"}and <Text style={[FONTS.fontSemiBold,{color:COLORS.primary}]}>Privacy Policy</Text>.</Text>
                    </View> */}
              <View style={{ paddingTop: 10 }}>
                <Text style={[FONTS.fontRegular, { fontSize: 14, color: colors.title }]}>{t("terms_of_use")}</Text>
              </View>
              <View style={{ paddingTop: 10 }}>
                <Button
                  title={t("get_sms")}
                  onPress={() => handleContinue()}
                />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 15, gap: 5, backgroundColor: theme.dark ? 'black' : 'white' }}>
                <View style={{ flex: 1, height: 1, backgroundColor: colors.text }} />
                <Text style={[FONTS.fontRegular, { fontSize: 16, color: colors.text, paddingHorizontal: 10 }]}>{t("or_continue_with")}</Text>
                <View style={{ flex: 1, height: 1, backgroundColor: colors.text }} />
              </View>
              <View
                style={{
                  minHeight: 30,
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingVertical: 10,
                  gap: 10,
                  backgroundColor: theme.dark ? 'black' : 'white',
                  borderBottomLeftRadius: 20,
                  borderBottomRightRadius: 20,
                }}
              >
                {/* Google */}
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '100%',
                    borderColor:COLORS.borderColor,
                    borderWidth:1,
                    padding:5,
                    borderRadius:30
                  }}
                  onPress={async () => {
                    try {
                      setLoading(true);
                      const token = await googleSignIn();
                      await Keychain.setGenericPassword('userToken', token);
                      await handleLogin(token);
                    } catch (error) {
                      Alert.alert('error:', error.response.data);
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  <Image style={{
                    width: 30,
                    height: 30,
                  }} source={IMAGES.google} />
                  <Text style={[FONTS.fontBold,{
                    flex: 1,         
                    textAlign: 'center',
                    fontSize: 16,     
                    marginRight:20
                  }]}>Google</Text>
                </TouchableOpacity>

                {/* Facebook */}
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '100%',
                    borderColor:COLORS.borderColor,
                    borderWidth:1,
                    padding:5,
                    borderRadius:30
                  }}
                  onPress={async () => {
                    try {
                      setLoading(true);
                      const token = await facebookLogin();
                      await Keychain.setGenericPassword('userToken', token);
                      await handleLogin(token);
                    } catch (error) {
                      Alert.alert('error:', error.response.data);
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  <Image style={{
                    width: 30,
                    height: 30,
                  }} source={IMAGES.facebook} />
                  <Text style={[FONTS.fontBold,{
                    flex: 1,          
                    textAlign: 'center',
                    fontSize: 16,     
                    marginRight:20      
                  }]}>Facebook</Text>
                </TouchableOpacity>
                {/* Email */}
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '100%',
                    borderColor:COLORS.borderColor,
                    borderWidth:1,
                    padding:5,
                    borderRadius:30
                  }}
                  onPress={() => { setEmailMode(true) }}
                >
                  <Feather  name="mail" size={30}  />
                  <Text style={[FONTS.fontBold,{
                    flex: 1,          // occupe l’espace restant
                    textAlign: 'center',
                    fontSize: 16,     
                    marginRight:20
                  }]}>{t("use_email")}</Text>
                </TouchableOpacity>
              </View>

            </ScrollView>





          </View>
        </View>
      </SafeAreaView>)}
    </ErrorBoundary>
  )
}

export default SignInPhone