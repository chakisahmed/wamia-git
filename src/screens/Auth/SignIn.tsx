import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Image, Alert, StyleSheet, TextInput, ActivityIndicator, Platform, Pressable } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { COLORS, FONTS } from '@/constants/theme';
import { GlobalStyleSheet } from '@/constants/StyleSheet';
import { CommonActions, useRoute, useTheme } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigation/RootStackParamList';
import Input from '@/components/Input/Input';
import Button from '@/components/Button/Button';
import { IMAGES } from '@/constants/Images';
import { login } from '@/api/loginApi'; // Import the login function
import { useDispatch } from 'react-redux';
import { setUserToken, setUser } from '@/redux/slices/authSlice';
import * as Keychain from 'react-native-keychain';

import { getCustomerDetails } from '@/api/customerApi';
import { assignGuestCartToCustomer, getCart } from '@/api/cartApi';
import { fetchWishlist } from '@/redux/slices/wishListSlice';
import { useTranslation } from 'react-i18next';
import { fetchCartItems } from '@/redux/slices/cartSlice';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { facebookLogin, googleSignIn } from '@/utils/sociallogins';
import { getApolloClient } from '@/api/apolloClient';
import { checkResetToken, requestPasswordReset, resetPassword } from '@/api/resetPassword';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ErrorBoundary } from '@/components/ErrorBoundary';
interface SignInScreenProps {
  navigation: any;
  route: any;
}

const SignIn = ({ navigation,route }: SignInScreenProps) => {
  const params = route.params;
  const { redirectTo }: { redirectTo?: string } = params != null ? params : { redirectTo: '' };
  const theme = useTheme();
  const { colors }: { colors: any } = theme;
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toggleResetPassword, setToggleResetPassword] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  // const [code, setCode] = useState(['', '', '', '', '']); // Initialize with empty strings
  const [rpToken, setRpToken] = useState('');
  const [rpTokenChecked, setRpTokenChecked] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [resetPasswordSuccess, setResetPasswordSuccess] = useState(false);

  // const inputRefs = [useRef<TextInput>(null), useRef<TextInput>(null), useRef<TextInput>(null), useRef<TextInput>(null), useRef<TextInput>(null)];
  const inputRef = useRef<TextInput>(null);




  useEffect(()=>{
    console.log(redirectTo)
  },[])
  WebBrowser.maybeCompleteAuthSession();


  const handleVerify = () => {
    // Handle verification logic
    //checkResetToken(code.join(''))
    if (rpToken.length > 0)
      setRpTokenChecked(true);
    else {
      Alert.alert('Please enter a valid token');
      return;
    }

  };

  const handleResend = () => {
    requestPasswordReset(email)
  };

  const handleFetchCartItems = () => {
    dispatch(fetchCartItems());
  };
  const handleLogin = async (token: any) => {

    let valid = true;
    if (email === "" && !token) {
      setEmailError(t("email_required"));
      valid = false;
    } else {
      setEmailError('');
    }

    if (password === "" && !token) {
      setPasswordError(t("password_required"));
      valid = false;
    } else {
      setPasswordError('');
    }

    if (!valid) {
      return;
    }


    if (!loading) {
      setLoading(true);
      try {



        const response = token ?? await login({ username: email.trim(), password: password.trim() });
        const customer = await getCustomerDetails();

        handleFetchCartItems();
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
        console.error("Error",error);
        Alert.alert('Login Failed', error.status == 401 ? t("invalid_email_or_password") : t('something_went_wrong'));
      }
      setLoading(false);
    }
  };

  return (
    <ErrorBoundary>
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.primary }}>
      <View style={[GlobalStyleSheet.container, { paddingVertical: 20 }]}>
        <View style={[GlobalStyleSheet.row, { alignItems: 'center', justifyContent: 'space-between' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <TouchableOpacity onPress={() => {
              rpTokenChecked ? setRpTokenChecked(false) : emailSubmitted ? setEmailSubmitted(false) : toggleResetPassword ? setToggleResetPassword(false) : navigation.goBack()
            }}>
              <Feather size={24} color={COLORS.card} name={'arrow-left'} />
            </TouchableOpacity>
            <Text style={[FONTS.fontMedium, { fontSize: 20, color: COLORS.card }]}>{t("login")}</Text>
          </View>

        </View>
      </View>
      {resetPasswordSuccess &&
        <View style={{ backgroundColor: 'green', padding: 10, borderRadius: 5, margin: 10 }}>
          <Text style={{ color: 'white' }}>{t("password_reset_success")}</Text>
        </View>
      }

      <View style={{ flex: 1, backgroundColor: theme.dark ? colors.background : COLORS.card, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
        <View style={[GlobalStyleSheet.container, { flexGrow: 1, marginTop: 15 }]}>
          {!toggleResetPassword &&
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={[FONTS.fontMedium, { fontSize: 18, color: colors.title, }]}>{t("registered_clients")}</Text>
              <Text style={[FONTS.fontRegular, { fontSize: 14, color: colors.text, }]}>{t('if_you_have_an_account_login_with_email')}</Text>
              <View>
                <Input
                  inputBorder
                  value={email}
                  onChangeText={(value) => { setEmail(value); setEmailError('') }}
                  placeholder={t("email")}
                  style={{ borderColor: emailError ? 'red' : COLORS.primary, paddingLeft: 0 }}
                />
                {emailError ? <Text style={{ color: 'red' }}>{emailError}</Text> : null}
                <View style={{ position: 'relative' }}>
                  <Input
                    inputBorder
                    value={password}
                    onChangeText={(value) => { setPassword(value); setPasswordError('') }}
                    placeholder={t("password")}
                    secureTextEntry={!showPassword}
                    style={{ borderColor: passwordError ? 'red' : COLORS.primary, paddingLeft: 0 }}
                  />
                  {passwordError ? <Text style={{ color: 'red' }}>{passwordError}</Text> : null}
                  <TouchableOpacity
                    style={{ position: 'absolute', right: 10, top: 10 }}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => setToggleResetPassword(!toggleResetPassword)}>
                  <Text style={[FONTS.fontRegular, { fontSize: 14, color: theme.dark ? COLORS.primaryLight : COLORS.primary, textDecorationLine: 'underline' }]}>{t("forgot_password")}</Text>
                </TouchableOpacity>
              </View>

              <Pressable
                style={{
                  backgroundColor: loading ? COLORS.lightGray : COLORS.secondary,
                  paddingVertical: 15,
                  borderRadius: 8,
                  alignItems: 'center',
                  marginTop: 20,
                }}
                onPress={() => handleLogin(null)}
                disabled={loading}
              >
                {loading ?
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  : <Text style={{ color: loading ? COLORS.gray : 'black', fontSize: 18, fontWeight: 'bold', }}>
                    {t("continue")}
                  </Text>}
              </Pressable>


              <View style={{ paddingTop: 10 }}>
                <Text style={[FONTS.fontRegular, { fontSize: 14, color: colors.title }]}>{t("terms_of_use")}</Text>
              </View>

              <Text style={[FONTS.fontMedium, { fontSize: 18, color: colors.title, marginTop: 40 }]}>{t("new_clients")}</Text>


              <Text style={[FONTS.fontRegular, { fontSize: 15, color: colors.text, }]}>
                {t("not_a_member") + " " + t("account_creation_benefits") + ' '}
                <Text
                  style={[
                    FONTS.fontRegular,
                    {
                      fontSize: 16,
                      color: theme.dark ? COLORS.primaryLight : COLORS.primary,
                      textDecorationLine: 'underline',
                      textDecorationColor: theme.dark ? COLORS.primaryLight : COLORS.primary,
                    },
                  ]}
                  onPress={() => {
                    navigation.navigate('SignUp', { redirectTo });
                  }}
                >
                  {t("create_account")}
                </Text>
              </Text>


              {/* social login section with line separator, then google and facebook icons aligned */}
              {!toggleResetPassword && <>
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 15, gap: 5, backgroundColor: theme.dark ? 'black' : 'white' }}>
                  <View style={{ flex: 1, height: 1, backgroundColor: colors.text }} />
                  <Text style={[FONTS.fontRegular, { fontSize: 16, color: colors.text, paddingHorizontal: 10 }]}>{t("or_continue_with")}</Text>
                  <View style={{ flex: 1, height: 1, backgroundColor: colors.text }} />
                </View>
              </>}
              <View style={{ minHeight: 60, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 20, gap: 50, backgroundColor: theme.dark ? 'black' : 'white', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}>
                {!toggleResetPassword && !loading && <>
                  <TouchableOpacity onPress={async () => {
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

                  }}>
                    <Image style={{ height: 60, width: 60 }} source={IMAGES.google} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={async () => {
                    try {
                      setLoading(true);
                      const token = await facebookLogin()
                      await Keychain.setGenericPassword('userToken', token);
                      await handleLogin(token);
                    } catch (error) {
                      Alert.alert('error:', error.response.data);

                    } finally {
                      setLoading(false);
                    }

                  }}>
                    <Image style={{ height: 60, width: 60, paddingBottom: 10 }} source={IMAGES.facebook} />
                  </TouchableOpacity>
                </>}

              </View>

            </ScrollView>}
          {/* ask user for their email in text input, then ask for password reset token */}
          {toggleResetPassword && !emailSubmitted &&

            <View style={{ flex: 1 }}>
              <ScrollView
                contentContainerStyle={{ padding: 20, flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
              >
                <Text style={[FONTS.fontMedium, { fontSize: 30, color: colors.title }]}>{t("forgot_password")}</Text>
                <Text style={[FONTS.fontRegular, { fontSize: 16, color: colors.text, marginTop: 10 }]}>
                  {t("please_enter_your_email_below_to_receive_a_password_reset_token")}
                </Text>
                <View style={{ marginTop: 10 }}>
                  <Input
                    inputBorder
                    value={email}
                    onChangeText={(value) => setEmail(value)}
                    placeholder={t("email")}
                    style={{ borderColor: COLORS.primary, paddingLeft: 0 }}
                  />
                </View>
              </ScrollView>
              <View style={{ padding: 20 }}>
                <Button
                  title={t("send_reset_token")}
                  onPress={() => {
                    handleResend();
                    setEmailSubmitted(true);
                  }}
                />
              </View>
            </View>
          }
          {emailSubmitted && !rpTokenChecked &&
            <>
              <KeyboardAwareScrollView
                contentContainerStyle={{padding: 20, flexGrow: 1, paddingBottom: 80}} // add paddingBottom for button space
                enableOnAndroid
                extraScrollHeight={0}
                keyboardShouldPersistTaps="handled"
              >
                <Text style={[FONTS.fontMedium, { fontSize: 30, color: colors.title }]}>{t("check_your_email")}</Text>
                <Text style={[FONTS.fontRegular, { fontSize: 16, color: colors.text, marginTop: 10, marginLeft:5 }]}>{t("reset_link_message").replace('{email}', email)}</Text>
                <View style={[styles.inputContainer,{paddingTop: 20}]}>
                  <TextInput
                    style={styles.inputBox}
                    onChangeText={(text) => {
                      setRpToken(text);
                    }}
                    ref={inputRef}
                    placeholder="Token: (ex: gGJKs45e...)"
                  />
                </View>
                <View style={[styles.resendContainer, { marginLeft: 10 }]}>
                  <Text style={styles.resendText}>{t("resend_email_prompt")}</Text>
                  <TouchableOpacity onPress={handleResend}>
                    <Text style={styles.resendLink}>{t("resend_email")}</Text>
                  </TouchableOpacity>
                </View>
              </KeyboardAwareScrollView>
              <View style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: theme.dark ? colors.background : COLORS.card,
                padding: 20,
                borderTopWidth: 1,
                borderColor: '#eee',
              }}>
                <Button
                  style={{ marginTop: 0 }}
                  title={t("verify_code")}
                  onPress={() => {
                    handleVerify();
                  }}
                />
              </View>
            </>
          }
          {emailSubmitted && rpTokenChecked &&

          <>
            <KeyboardAwareScrollView
              contentContainerStyle={[styles.container,{padding:20}]}   // centre le contenu
              enableOnAndroid                           // active l’offset sur Android
              extraScrollHeight={0}                    // petit supplément pour ne rien couper
              keyboardShouldPersistTaps="handled"       // touche « Valider » garde le clavier
            >
              <Text style={[FONTS.fontMedium, { fontSize: 30, color: colors.title }]}>{t("reset_password")}</Text>
              <Text style={[FONTS.fontRegular, { fontSize: 16, color: colors.text, marginTop: 10, marginLeft:5 }]}>
                {t("enter_new_password")}
              </Text>
              <View style={[styles.inputContainer,{marginHorizontal:5,marginTop:20}]}>
                <Input
                  inputBorder
                  value={password}
                  onChangeText={(value) => setPassword(value)}
                  placeholder={t("new_password")}
                  secureTextEntry={!showPassword}
                  style={{ borderColor: COLORS.primary, paddingLeft: 0, marginBottom: 10 }}
                />

                <TouchableOpacity
                  style={{ position: 'absolute', right: 10, top: 10 }}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
              <View style={[styles.inputContainer,{marginHorizontal:5}]}>
                <Input
                  inputBorder
                  value={confirmPassword}
                  onChangeText={(value) => setConfirmPassword(value)}
                  placeholder={t("confirm_password")}
                  secureTextEntry={!showPassword}
                  style={{ borderColor: COLORS.primary, paddingLeft: 0, marginBottom: 10 }}
                />

                <TouchableOpacity
                  style={{ position: 'absolute', right: 10, top: 10 }}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
              
            </KeyboardAwareScrollView>
            <View style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: theme.dark ? colors.background : COLORS.card,
                padding: 20,
                borderTopWidth: 1,
                borderColor: '#eee',
              }}>
                <Button
                
                title={t("reset_password")}
                onPress={async () => {
                  if (password !== confirmPassword) {
                    Alert.alert(t("passwords_do_not_match"));
                    return;
                  }

                  const response = await resetPassword({ email, newPassword: password, resetToken: rpToken });
                  if (response) {

                    setResetPasswordSuccess(true);

                    setToggleResetPassword(false);
                    setEmailSubmitted(false);
                    setRpTokenChecked(false);
                    setRpToken('');
                    setPassword('');
                    setConfirmPassword('');
                  }

                }}
              />
              </View>
            </>
            

          }
          <View>
          </View>
        </View>
      </View>




      {/*empty view with 60 height*/}

    </SafeAreaView></ErrorBoundary>
  );
};
const styles = StyleSheet.create({
  container: { flex: 1 },
  backButton: {
    position: 'absolute',
    top: 20, // Adjust as needed
    left: 20, // Adjust as needed
    padding: 10, // Add padding around the text to tap area
  },
  backIcon: {
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 50,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: 'gray',
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginBottom: 20,

  },
  inputBox: {

    height: 50,
    backgroundColor: 'white',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    padding: 10,
    justifyContent: 'center',
    marginHorizontal: 5,
    marginBottom: 10,
  },
  inputDigit: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  verifyButton: {
    backgroundColor: '#6078ea',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resendContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  resendText: {
    fontSize: 14,
    color: 'gray',
  },
  resendLink: {
    fontSize: 14,
    color: '#6078ea',
    marginLeft: 5,
  },
});
export default SignIn;