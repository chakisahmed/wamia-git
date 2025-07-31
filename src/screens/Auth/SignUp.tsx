import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import React, { use, useEffect, useState } from 'react';
import { COLORS, FONTS } from '../../constants/theme';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { useRoute, useTheme, CommonActions } from '@react-navigation/native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/RootStackParamList';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import SelectCountery from '../../components/SelectCountery';
import { signup } from '../../api/signupApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { setUser, setUserToken } from '../../redux/slices/authSlice';
import { SignupPayload } from '../../api/signupApi';
import { getCustomerDetails, isEmailAvailable } from '../../api/customerApi';
import { assignGuestCartToCustomer, getCart } from '../../api/cartApi';
import { useTranslation } from 'react-i18next';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import CustomPicker from '../../components/CustomPicker';
import { getCities, getStates, getZipCodes } from '../../api/regionsandcitiesApi';
import { IMAGES } from '../../constants/Images';


type SignUpScreenProps = StackScreenProps<RootStackParamList, 'SignUp'>;

const SignUp = ({ navigation }: SignUpScreenProps) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const route = useRoute();
  const params = route.params;
  const { redirectTo }: { redirectTo?: string } = params != null ? params : { redirectTo: '' };
  //console.log('SignUp redirectTo', redirectTo);
  const { colors }: { colors: any } = theme;
  const { t } = useTranslation();


  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState({ flag: 'TN', dial_code: '216', code: 'TN', name: 'Tunisia' });
  const [street, setStreet] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [invalidPasswordError, setInvalidPasswordError] = useState<string[]>([]);
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [fullNameError, setFullNameError] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');
  const [countryError, setCountryError] = useState('');
  const [regionError, setRegionError] = useState('');
  const [postcodeError, setPostcodeError] = useState('');
  const [cityError, setCityError] = useState('');
  const [streetError, setStreetError] = useState('');


  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [zipCodes, setZipCodes] = useState<any[]>([]);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedZipCode, setSelectedZipCode] = useState(null);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await getStates();
        console.log('States:', response);
        setStates(response);
      } catch (error) {
        console.error('Error fetching states:', error);
      }
    };

    fetchStates();
  }, []);

  // useffect for cities depending on selected state
  useEffect(() => {
    const fetchCities = async () => {
      try {
        if (selectedState) {
          const response = await getCities(selectedState.label);
          setCities(response);
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
      }
    };

    fetchCities();
  }, [selectedState]);
  useEffect(() => {
    const fetchZipCodes = async () => {
      try {
        if (selectedCity) {
          const response = await getZipCodes(selectedCity.label);
          setZipCodes(response);
        }
      } catch (error) {
        console.error('Error fetching zip codes:', error);
      }
    };

    fetchZipCodes();
  }, [selectedCity]);

  const passwordValidation = (password: string) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isValidLength = password.length >= 8;
    //return array failed tests
    const failedTests = [];
    if (!hasUpperCase) {
      failedTests.push(t('password_must_contain_uppercase'));
    }
    if (!hasLowerCase) {
      failedTests.push(t('password_must_contain_lowercase'));
    }
    if (!hasNumber) {
      failedTests.push(t('password_must_contain_number'));
    }
    if (!hasSpecialChar) {
      failedTests.push(t('password_must_contain_special_character'));
    }
    if (!isValidLength) {
      failedTests.push(t('password_must_contain_minimum_8_characters'));
    }

    return failedTests;
  };

  const handleNextStep = async () => {
    if (step === 1) {
      let valid = true;
      if (!email) {
        setEmailError(t("email_required"));
        valid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setEmailError(t('invalid_email_format'));
        valid = false;
      } else {

        const emailAvailability = await isEmailAvailable(email);
        if(!emailAvailability){
          setEmailError(t('email_already_exists'));
          valid = false;
        } else {
          setEmailError('');
        }
      }



      if (!password) {
        setPasswordError(t("password_required"));
        valid = false;
      } else {
        setPasswordError('');
      }
      const passwordValidationErrors = passwordValidation(password);
      if (passwordValidationErrors.length > 0) {
        setInvalidPasswordError(passwordValidationErrors);
        valid = false;
      } else {
        setPasswordError('');
      }

      if (!confirmPassword) {
        setConfirmPasswordError(t("confirm_password_required"));
        valid = false;
      } else if (password.trim() != confirmPassword.trim()) {
        setConfirmPasswordError(t('passwords_do_not_match'));
        valid = false;
      } else {
        setConfirmPasswordError('');
      }

      if (!valid) {
        return;
      }
    }
    if (step === 2) {
      let valid = true;
      if (!fullName.trim()) {
        setFullNameError(t("full_name_required"));
        valid = false;
      } else if (!(fullName.trim().split(' ').length > 1)) {
        setFullNameError(t('full_name_must_contain_first_name_and_last_name'));
        valid = false;
      } else {
        setFullNameError('');
      }

      if (!phoneNumber) {
        setPhoneNumberError(t("phone_number_required"));
        valid = false;
      } else {
        setPhoneNumberError('');
      }

      if (!country) {
        setCountryError(t("country_required"));
        valid = false;
      } else {
        setCountryError('');
      }

      if (!valid) {
        return;
      }
    }
    setStep(step + 1);
  };

  const handleSignUp = async () => {

    let valid = true;
    

    

    if (!selectedState) {
      setRegionError(t("region_required"));
      valid = false;
    } else {
      setRegionError('');
    }

    if (!selectedZipCode) {
      setPostcodeError(t("postcode_required"));
      valid = false;
    } else {
      setPostcodeError('');
    }

    if (!selectedCity) {
      setCityError(t("city_required"));
      valid = false;
    } else {
      setCityError('');
    }

    if (!street) {
      setStreetError(t("street_required"));
      valid = false;
    } else {
      setStreetError('');
    }

    if (!valid) {
      return;
    }

    try {

      const payload: SignupPayload = {
        customer: {
          email,
          firstname: fullName.trim().split(' ')[0],
          lastname: fullName.trim().split(' ')[1],
          addresses: [
            {
              defaultShipping: true,
              defaultBilling: true,
              firstname: fullName.trim().split(' ')[0],
              lastname: fullName.trim().split(' ')[1],
              region: {
                regionCode: selectedState.label,
                region: selectedState.label,
                regionId: selectedState.value,
              },
              postcode:selectedZipCode.label,
              street: [street.trim()],
              city:selectedCity.label,
              telephone: phoneNumber.trim(),
              countryId: country.code,
            },
          ],
        },  
        password: password.trim(),
      };
      console.log('payload', JSON.stringify(payload));
      //return ;

      setLoading(true);
      const response = await signup(payload);


      //console.log(payload,' : ',response);
      await AsyncStorage.setItem('userToken', response);
      dispatch(setUserToken(response));
      const customer = await getCustomerDetails()
      dispatch(setUser(customer))


      if (redirectTo != '') {
        const customer = await getCustomerDetails();
        //console.log('customer', customer);
        const response1 = await assignGuestCartToCustomer(customer);
        //console.log(response1);
        if (response1) {
          //console.log('Guest cart assigned to customer');
          const cart = await getCart();
          //console.log('cart', cart);
          // Reset navigation stack and navigate to redirectTo
          navigation.navigate(redirectTo, {
            cart, addresses: {
              billing: customer.addresses.find(address => address.default_billing),
              shipping: customer.addresses.find(address => address.default_shipping)
            }
          });
        }
      } else {
        // Reset navigation stack and navigate to Home
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              { name: 'DrawerNavigation', params: { screen: 'Home' } },
            ],
          })
        );
      }
      setLoading(false);

    } catch (error) {
      //console.log(error);
      alert(error.response.data.message);
      setLoading(false);
    }
  };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.primary }}>
      <View style={[GlobalStyleSheet.container, { paddingVertical: 20 }]}>
        <View style={[GlobalStyleSheet.row, { alignItems: 'center', justifyContent: 'space-between' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              accessibilityLabel={t("go_back_button")}>
              <Feather size={24} color={COLORS.card} name={'arrow-left'} />
            </TouchableOpacity>
            <Text style={[FONTS.fontMedium, { fontSize: 20, color: COLORS.card }]}>{t("create_account_title")}</Text>
          </View>
        </View>
      </View>
      <View style={{ flex: 1, backgroundColor: theme.dark ? colors.background : colors.card, borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
        <View style={[GlobalStyleSheet.container, { flexGrow: 1, marginTop: 15 /* consider uniform spacing via global styles */ }]}>
          <KeyboardAwareScrollView keyboardShouldPersistTaps="handled">
            {step === 1 && (
              <>
                <Text style={[FONTS.fontMedium, { fontSize: 18, color: colors.title }]}>{t("step_1")}</Text>



                <View style={{ paddingTop: 15 }}>
                  <Text style={[FONTS.fontMedium, { fontSize: 14, color: colors.text }]}>{t("email")}</Text>

                  <Input
                    inputBorder

                    value={email}
                    onChangeText={(value) => { setEmail(value); setEmailError(''); }}
                    style={{ borderColor: emailError ? 'red' : COLORS.primary, paddingLeft: 0 }}
                    accessibilityLabel={t("email_input")}
                  />
                </View>
                {emailError ? <Text style={{ color: 'red' }}>{emailError}</Text> : null}
                <View style={{ paddingTop: 15 }}>
                  <Text style={[FONTS.fontMedium, { fontSize: 14, color: colors.text }]}>{t("password")}</Text>
                  <View style={{ position: 'relative' }}>
                    <Input
                      inputBorder
                      value={password}
                      onChangeText={(value) => { setPassword(value); setPasswordError(''); setInvalidPasswordError([]); }}
                      secureTextEntry={!showPassword}
                      style={{ borderColor: passwordError ? 'red' : COLORS.primary, paddingLeft: 0 }}
                      accessibilityLabel={t("password_input")}
                    />
                    <TouchableOpacity
                      style={{ position: 'absolute', right: 10, top: 10 }}
                      onPress={() => setShowPassword(!showPassword)}
                      accessibilityLabel={t(showPassword ? "hide_password" : "show_password")}>
                      <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
                {passwordError ? <Text style={{ color: 'red' }}>{passwordError}</Text> : null}
                {invalidPasswordError ? (
                  <View style={{ paddingTop: 15 }}>
                    {invalidPasswordError.map((error, index) => (
                      <Text key={index} style={{ color: 'red' }}>{error}</Text>
                    ))}
                  </View>
                ) : null}

                <View style={{ paddingTop: 15 }}>
                  <Text style={[FONTS.fontMedium, { fontSize: 14, color: colors.text }]}>{t("confirm_password")}</Text>
                  <Input
                    inputBorder
                    value={confirmPassword}
                    onChangeText={(value) => { setConfirmPassword(value); setConfirmPasswordError(''); }}
                    secureTextEntry={!showPassword}
                    style={{ borderColor: confirmPasswordError ? 'red' : COLORS.primary, paddingLeft: 0 }}
                    accessibilityLabel={t("confirm_password_input")}
                  />
                </View>
                {confirmPasswordError ? <Text style={{ color: 'red' }}>{confirmPasswordError}</Text> : null}
              </>
            )}
            {step === 2 && (
              <>
                <Text style={[FONTS.fontMedium, { fontSize: 18, color: colors.title }]}>{t("step_2")}</Text>
                <View style={{ paddingTop: 15 }}>
                  <Text style={[FONTS.fontMedium, { fontSize: 14, color: colors.text }]}>{t("full_name")}</Text>
                  <Input
                    inputBorder
                    value={fullName}
                    icon={<FontAwesome name={'user'} size={20} color={COLORS.primary} />}
                    onChangeText={(value) => { setFullName(value); setFullNameError(''); }}
                    style={{ borderColor: fullNameError ? 'red' : COLORS.primary, paddingLeft: 40 }}
                    accessibilityLabel={t("full_name_input")}
                  />
                  {fullNameError ? <Text style={{ color: 'red' }}>{fullNameError}</Text> : null}
                </View>
                <View style={{ paddingTop: 15 }}>
                  <Text style={[FONTS.fontMedium, { fontSize: 14, color: colors.text }]}>{t("phone_number")}</Text>

                  <View>
                    <Input
                      inputBorder
                      value={phoneNumber}
                      onChangeText={(value) => { setPhoneNumber(value); setPhoneNumberError(''); }}
                      keyboardType={'number-pad'}
                      style={{ borderColor: phoneNumberError ? 'red' : COLORS.primary, paddingLeft: 70 }}
                      accessibilityLabel={t("phone_number_input")}
                    />
                    <View style={{ position: 'absolute', top: 12, left: 0 }}>
                      <SelectCountery onSelect={(value) => {
                        setCountry(value);
                        setCountryError('');

                      }} />
                    </View>
                    {phoneNumberError ? <Text style={{ color: 'red' }}>{phoneNumberError}</Text> : null}

                  </View>
                </View>

              </>

            )}
            {step === 3 && (
              <>
              <Text style={[FONTS.fontMedium, { fontSize: 18, color: colors.title }]}>{t("step_3")}</Text>
                <View style={{ paddingTop: 15 }}>
                  <Text style={[FONTS.fontMedium, { fontSize: 14, color: colors.text, paddingBottom: 10 }]}>{t("region")}</Text>



                  {/* <Input
                  inputBorder
                  
                  value={region}
                  onChangeText={(value) => { setRegion(value); setRegionError(''); }}
                  style={{ borderColor: regionError ? 'red' : COLORS.primary, paddingLeft: 40 }}
                  accessibilityLabel={t("region_input")}
                /> */}

                  {states && <CustomPicker
                    options={states.map((state) => ({
                      label: state.states_name,
                      value: state.entity_id,
                    }))}
                    selectedValue={selectedState}
                    onValueChange={(value) => {setSelectedState(value); setRegionError(''); setSelectedCity(null); setZipCodes([]); setSelectedZipCode(null);}}
                    placeholder={t("select_region")}
                    searchPlaceholder={t("search_region")}
                    borderColor={regionError ? 'red' : theme.dark? COLORS.primaryLight:COLORS.primary}
                    leadingIcon={theme.dark?IMAGES.region_dark: IMAGES.region}
                  />}

                  {regionError ? <Text style={{ color: 'red' }}>{regionError}</Text> : null}
                </View>




                <View style={{ paddingTop: 15 }}>

                  <Text style={[FONTS.fontMedium, { fontSize: 14, color: colors.text, paddingBottom: 10 }]}>{t("city")}</Text>
                  {/* <Input
                  inputBorder
                  value={city}
                  onChangeText={(value) => { setCity(value); setCityError(''); }}
                  style={{ borderColor: cityError ? 'red' : COLORS.primary, paddingLeft: 40 }}
                  accessibilityLabel={t("city_input")}
                /> */}
                  {cities.length > 0 ? (<CustomPicker
                    options={cities.map((city) => ({
                      label: city.cities_name,
                      value: city.entity_id,
                    }))}
                    selectedValue={selectedCity}
                    onValueChange={(value) => {
                      setSelectedCity(value)
                      setCityError('');
                      setSelectedZipCode(null);
                      setZipCodes([]);
                      setPostcodeError('');
                    
                    }}
                    placeholder={t("select_city")}
                    searchPlaceholder={t("search_city")}
                    borderColor={cityError ? 'red' : theme.dark? COLORS.primaryLight:COLORS.primary}
                    leadingIcon={theme.dark? IMAGES.cities_dark:IMAGES.cities}
                  />) : (<View style={{ height: 45, width: "100%", borderColor: '#ccc', borderWidth: 1, borderRadius: 8, padding: 10, justifyContent: 'center', alignItems: 'center' }}>

                    <Text style={{ color: 'gray' }}>{t("please_select_a_state")}</Text>
                  </View>)}
                  {cityError ? <Text style={{ color: 'red' }}>{cityError}</Text> : null}
                </View>
                <View style={{ paddingTop: 15 }}>

                  <Text style={[FONTS.fontMedium, { fontSize: 14, color: colors.text,paddingBottom:14 }]}>{t("postcode")}</Text>
                  {/* <Input
                    inputBorder
                    value={postcode}
                    onChangeText={(value) => { setPostcode(value); setPostcodeError(''); }}
                    style={{ borderColor: postcodeError ? 'red' : COLORS.primary, paddingLeft: 40 }}
                    accessibilityLabel={t("address_input")}
                  /> */}
                  {zipCodes && zipCodes.length > 0 ? (<CustomPicker
                    options={zipCodes.map((zc) => ({
                      label: zc.zip_code,
                      value: zc.entity_id,
                    }))}
                    selectedValue={selectedZipCode}
                    onValueChange={(value) => {setSelectedZipCode(value); setPostcodeError('');}}
                    placeholder={t("select_zip_code")}
                    searchPlaceholder={t("search_zip_code")}
                    borderColor={postcodeError ? 'red' : theme.dark? COLORS.primaryLight:COLORS.primary}
                    leadingIcon={theme.dark?IMAGES.zipcode_dark:IMAGES.zipcode}
                  />) : (<View style={{ height: 45, width: "100%", borderColor: '#ccc', borderWidth: 1, borderRadius: 8, padding: 10, justifyContent: 'center', alignItems: 'center' }}>

                    <Text style={{ color: 'gray' }}>{t("please_select_a_city")}</Text>
                  </View>)}
                  {postcodeError!='' ? <Text style={{ color: 'red' }}>{postcodeError}</Text> : null}
                </View>
                <View style={{ paddingTop: 15 }}/>
                <Text style={[FONTS.fontMedium, { fontSize: 14, color: colors.text, }]}>{t("street")}</Text>
                <Input
                  inputBorder
                  value={street}
                  onChangeText={(value) => { setStreet(value); setStreetError(''); }}
                  style={{ borderColor: streetError ? 'red' : COLORS.primary, paddingLeft: 40 }}
                  accessibilityLabel={t("street_input")}
                />
                {streetError ? <Text style={{ color: 'red' }}>{streetError}</Text> : null}


              </>
            )}
          </KeyboardAwareScrollView>
          <View style={{ flexDirection: 'row', justifyContent: step === 1 ? 'flex-end' : 'space-between', padding: 15 }}>
            {step > 1 && (
              <TouchableOpacity
                style={{
                  marginTop: 0,
                  backgroundColor: loading ? COLORS.lightGray : COLORS.secondary,
                  paddingVertical: 15,
                  borderRadius: 8,
                  alignItems: 'center',
                  width: 100
                }}
                onPress={() => setStep(step - 1)}
                disabled={loading}
                accessibilityLabel={t("back_button")}>
                {loading ?
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  : <Text style={{ color: loading ? COLORS.gray : 'black', fontSize: 18, fontWeight: 'bold', alignContent: 'center' }}>
                    {t("back")}
                  </Text>}
              </TouchableOpacity>
            )}
            {step < 3 && !loading ? (
              <TouchableOpacity
                style={{
                  marginTop: 0,
                  backgroundColor: COLORS.secondary,
                  paddingVertical: 15,
                  borderRadius: 8,
                  alignItems: 'center',
                  width: 100
                }}
                onPress={handleNextStep}
                disabled={loading}
                accessibilityLabel={t("next_button")}>
                <Text style={{ color: 'black', fontSize: 18, fontWeight: 'bold', alignContent: 'center' }}>
                  {t("next")}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={{
                  marginTop: 0,
                  backgroundColor: loading ? COLORS.lightGray : COLORS.secondary,
                  paddingVertical: 15,
                  borderRadius: 8,
                  alignItems: 'center',
                  width: 100
                }}
                onPress={handleSignUp}
                disabled={loading}
                accessibilityLabel={t("sign_up_button")}>
                {loading ?
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  : <Text style={{ color: loading ? COLORS.gray : 'black', fontSize: 18, fontWeight: 'bold', alignContent: 'center' }}>
                    {t("sign_up")}
                  </Text>}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5', // Light background for the app
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  selectedValue: {
    marginTop: 10,
    fontSize: 14,
    color: '#555',
  },
});
export default SignUp;