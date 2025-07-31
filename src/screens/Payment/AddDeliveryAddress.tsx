import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRoute, useTheme } from '@react-navigation/native';
import Header from '@/layout/Header';
import { ScrollView } from 'react-native-gesture-handler';
import { COLORS, FONTS } from '@/constants/theme';
import Input from '@/components/Input/Input';
import { GlobalStyleSheet } from '@/constants/StyleSheet';
import Button from '@/components/Button/Button';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigation/RootStackParamList';
import SelectCountery from '@/components/SelectCountery';
import { BillingAddress } from '@/api/cartApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { getCustomerDetails } from '@/api/customerApi';
import { addAddress } from '@/api/addressesApi';
import { City, getCities, getStates, getZipCodes, State, ZipCode } from '@/api/regionsandcitiesApi';
import CustomPicker from '@/components/CustomPicker';
import { IMAGES } from '@/constants/Images';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import ErrorComponent from '../Components/ErrorComponent';
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';

type AddDeliveryAddressScreenProps = StackScreenProps<RootStackParamList, 'AddDeliveryAddress'>;

const AddDeliveryAddress = ({ navigation }: AddDeliveryAddressScreenProps) => {
  const route = useRoute();
  const { onGoBack, origin } = route.params as { onGoBack: (address: any) => void, origin: string };

  const [fullName, setFullName] = useState('');
  const [fullNameError, setFullNameError] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [mobileNumberError, setMobileNumberError] = useState('');
  const [emailError, setEmailError] = useState('');

  const [country, setCountry] = useState({ flag: 'TN', dial_code: '216', code: 'TN', name: 'Tunisia' });
  const [, setCountryError] = useState('');
  const [] = useState('Home');
  const { t } = useTranslation();
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [zipCodes, setZipCodes] = useState<ZipCode[]>([]);
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedZipCode, setSelectedZipCode] = useState<ZipCode | null>(null);
  const token = useSelector((state:RootState)=>state.auth.userToken)

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isCitiesLoading, setIsCitiesLoading] = useState(false);
  const [isZipsLoading, setIsZipsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [regionError, setRegionError] = useState('');
  const [postcodeError, setPostcodeError] = useState('');
  const [cityError, setCityError] = useState('');
  const [street, setStreet] = useState('');
  const [streetError, setStreetError] = useState('');

  const controller = useRef(new AbortController())
  const handleSaveAddress = async () => {
    if (isSubmitting) return;
    let validation = true;
    if (fullName === '') {
      setFullNameError(t('full_name_required'));

      validation = false;
    }
    if (fullName.split(' ').length < 2) {
      setFullNameError(t('full_name_must_contain_first_name_and_last_name'));
      validation = false;
    }
    if (email === '') {
      setEmailError(t('email_required'));
      validation = false;
    }
    //validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError(t('invalid_email'));
      validation = false;
    }
    if (mobileNumber === '') {
      setMobileNumberError(t('phone_number_required'));
      validation = false;
    }
    if (selectedState === null) {
      setRegionError(t('please_select_a_state'));
      validation = false;
    }
    if (selectedCity === null) {
      setCityError(t('please_select_a_city'));
      validation = false;
    }
    if (selectedZipCode === null) {
      setPostcodeError(t('postcode_required'));
      validation = false;
    }
    if (street === '') {
      setStreetError(t('street_required'));
      validation = false;
    }

    if (!validation) {
      return;
    }

    setIsSubmitting(true)

    try {
      const address = {
        id: 0,
        customer_id: 0,
        firstname: fullName.split(' ')[0],
        lastname: fullName.split(' ')[1],
        telephone: mobileNumber,
        postcode: selectedZipCode?.label,
        email,


        street: [street],
        city: selectedCity?.label,
        region: selectedState?.label,
        country_id: country.code,
        default_billing: false,
        default_shipping: false,
      };


      const resp = await addAddress(address,token);



      onGoBack(resp.addresses[resp.addresses.length - 1]);
      navigation.goBack();

    } catch (error) {
      console.error("Failed to save address:", error);
      Alert.alert(
        t('error'),
        t('error_general') // Créez cette traduction: "An error occurred while saving the address. Please try again."
      );
    } finally {
      // Toujours réactiver le bouton
      setIsSubmitting(false);
    }


  };



  const fetchStates = useCallback(async () => {


    const signal = controller.current.signal

    if(signal.aborted)return

    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await getStates();
      if (!signal.aborted) {
        setStates(response);
      }
    } catch (error: any) {
        

     if (error.request) {
      setLoadError(error.message)
    } else {
      setLoadError(t("error_general"))
    }
      

      if (!signal.aborted) {
        //setLoadError(t('error_loading_regions'));
      }
    } finally {
      if (!signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [t]);

  useEffect(() => {
        controller.current?.abort();

    // Repartir sur un contrôleur neuf
    controller.current = new AbortController();
    const signal = controller.current.signal
    fetchStates(); // Appelle simplement notre fonction réutilisable

    // La fonction de nettoyage s'assure qu'aucune mise à jour d'état
    // n'est tentée si l'utilisateur quitte l'écran pendant le chargement.
    return () => {
        controller.current.abort()
    };
}, [fetchStates]); // La dépendance est maintenant la fonction elle-même

  // A MODIFIER : useEffect pour charger les villes
  useEffect(() => {
    const fetchCities = async () => {
      if (selectedState) {
        setIsCitiesLoading(true);
        setCities([]); // Vider les villes précédentes
        try {
          const response = await getCities(selectedState.label);
          setCities(response);
        } catch (error) {
          console.error('Error fetching cities:', error);
          Alert.alert(t('error'), t('error_loading_cities'));
        } finally {
          setIsCitiesLoading(false);
        }
      }
    };
    fetchCities();
  }, [selectedState]);

  // A MODIFIER : useEffect pour charger les codes postaux
  useEffect(() => {
    const fetchZipCodes = async () => {
      if (selectedCity) {
        setIsZipsLoading(true);
        setZipCodes([]); // Vider les codes postaux précédents
        try {
          const response = await getZipCodes(selectedCity.label);
          setZipCodes(response);
        } catch (error) {
          console.error('Error fetching zip codes:', error);
          Alert.alert(t('error'), t('error_loading_zip_codes'));
        } finally {
          setIsZipsLoading(false);
        }
      }
    };
    fetchZipCodes();
  }, [selectedCity]);
  const theme = useTheme();
  const { colors }: { colors: any } = theme;

  const productSizes = ["Home", "Shop", "Office"];


  const [email, setEmail] = useState('');



  return (
    <ErrorBoundary>
      <View style={{ backgroundColor: colors.background, flex: 1 }}>
        <Header
          title={t('add_delivery_address')}
          leftIcon='back'
          titleRight
        />
        {origin && <View
          style={[GlobalStyleSheet.container,
          {
            paddingHorizontal: 15,
            backgroundColor: theme.dark ? 'rgba(255,255,255,.1)' : colors.card,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.35,
            shadowRadius: 6.27,
            elevation: 5,
          }
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <View style={{ height: 18, width: 18, borderRadius: 30, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={[FONTS.fontMedium, { fontSize: 10, color: COLORS.card }]}>1</Text>
              </View>
              <Text style={[FONTS.fontMedium, { fontSize: 13, color: colors.title }]}>{t('cart')}</Text>
            </View>
            <View style={{ height: 2, flex: 1, backgroundColor: COLORS.primary, marginHorizontal: 10 }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <View style={{ height: 18, width: 18, borderRadius: 30, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={[FONTS.fontMedium, { fontSize: 10, color: COLORS.card }]}>2</Text>
              </View>
              <Text style={[FONTS.fontMedium, { fontSize: 13, color: colors.title }]}>{t('address')}</Text>
            </View>
            <View style={{ height: 2, flex: 1, backgroundColor: colors.title, opacity: .1, marginHorizontal: 10 }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <View style={{ height: 18, width: 18, borderRadius: 30, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={[FONTS.fontMedium, { fontSize: 10, color: COLORS.title }]}>3</Text>
              </View>
              <Text style={[FONTS.fontMedium, { fontSize: 13, color: colors.text }]}>{t('payment')}</Text>
            </View>
          </View>
        </View>}
        {isLoading ? (
          <ActivityIndicator style={{ flex: 1 }} size="large" color={COLORS.primary} />
        ) : loadError ? (
          <ErrorComponent message={loadError} onRetry={() => { fetchStates()}} />
        ) : (<ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
          <View style={[GlobalStyleSheet.container, { backgroundColor: theme.dark ? 'rgba(255,255,255,.1)' : colors.card, marginTop: 15 }]}>
            <Text style={{ ...FONTS.fontMedium, fontSize: 18, color: colors.title, borderBottomWidth: 1, borderBottomColor: COLORS.primaryLight, marginHorizontal: -15, paddingHorizontal: 15, paddingBottom: 15 }}>{t('contact_details')}</Text>
            <View style={{ marginBottom: 20, marginTop: 15 }}>
              <Text style={[FONTS.fontMedium, { fontSize: 14, color: colors.text }]}>{t('full_name')}</Text>
              <Input

                inputBorder
                onChangeText={(value) => { setFullName(value); setFullNameError(''); }}
                style={{ borderColor: fullNameError ? 'red' : COLORS.primaryLight, paddingLeft: 0 }}
              />
              {fullNameError ? <Text style={{ color: 'red' }}>{fullNameError}</Text> : null}
            </View>

            <View style={{ paddingTop: 0 }}>

              <Text style={[FONTS.fontMedium, { fontSize: 14, color: colors.text }]}>{t("phone_number")}</Text>

              <View>
                <Input
                  inputBorder
                  value={mobileNumber}
                  onChangeText={(value) => { setMobileNumber(value); setMobileNumberError(''); }}
                  keyboardType={'number-pad'}
                  style={{ borderColor: mobileNumberError ? 'red' : COLORS.primaryLight, paddingLeft: 70 }}
                  accessibilityLabel={t("phone_number_input")}
                />
                <View style={{ position: 'absolute', top: 12, left: 0 }}>
                  <SelectCountery onSelect={(value) => {
                    setCountry(value);
                    setCountryError('');

                  }} />
                </View>
                {mobileNumberError ? <Text style={{ color: 'red' }}>{mobileNumberError}</Text> : null}

              </View>
            </View>
            <View style={{ marginTop: 15 }}>
              <Text style={[FONTS.fontMedium, { fontSize: 14, color: colors.text }]}>{t('email')}</Text>

              <Input

                inputBorder
                value={email}
                onChangeText={(value) => { setEmail(value); setEmailError(''); }}
                style={{ borderColor: mobileNumberError ? 'red' : COLORS.primaryLight, paddingLeft: 0 }}
              />
            </View>
            {emailError ? <Text style={{ color: 'red' }}>{emailError}</Text> : null}
          </View>
          <View style={[GlobalStyleSheet.container, { backgroundColor: theme.dark ? 'rgba(255,255,255,.1)' : colors.card, marginTop: 15 }]}>
            <Text style={{ ...FONTS.fontMedium, fontSize: 18, color: colors.title, borderBottomWidth: 1, borderBottomColor: COLORS.primaryLight, marginHorizontal: -15, paddingHorizontal: 15, paddingBottom: 15 }}>{t('address')}</Text>
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
                onValueChange={(value) => { setSelectedState(value); setRegionError(''); setSelectedCity(null); setZipCodes([]); setSelectedZipCode(null); }}
                placeholder={t("select_region")}
                searchPlaceholder={t("search_region")}
                borderColor={regionError ? 'red' : theme.dark ? COLORS.primaryLight : COLORS.primary}
                leadingIcon={theme.dark ? IMAGES.region_dark : IMAGES.region}
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
                borderColor={cityError ? 'red' : theme.dark ? COLORS.primaryLight : COLORS.primary}
                leadingIcon={theme.dark ? IMAGES.cities_dark : IMAGES.cities}
              />) : (<View style={{ height: 45, width: "100%", borderColor: COLORS.primaryLight, borderWidth: 1, borderRadius: 8, padding: 10, justifyContent: 'center', alignItems: 'center' }}>

                <Text style={{ color: 'gray' }}>{t("please_select_a_state")}</Text>
              </View>)}
              {cityError ? <Text style={{ color: 'red' }}>{cityError}</Text> : null}
            </View>
            <View style={{ paddingTop: 15 }}>

              <Text style={[FONTS.fontMedium, { fontSize: 14, color: colors.text, paddingBottom: 14 }]}>{t("postcode")}</Text>
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
                onValueChange={(value) => { setSelectedZipCode(value); setPostcodeError(''); }}
                placeholder={t("select_zip_code")}
                searchPlaceholder={t("search_zip_code")}
                borderColor={postcodeError ? 'red' : theme.dark ? COLORS.primaryLight : COLORS.primary}
                leadingIcon={theme.dark ? IMAGES.zipcode_dark : IMAGES.zipcode}
              />) : (<View style={{ height: 45, width: "100%", borderColor: COLORS.primaryLight, borderWidth: 1, borderRadius: 8, padding: 10, justifyContent: 'center', alignItems: 'center' }}>

                <Text style={{ color: 'gray' }}>{t("please_select_a_city")}</Text>
              </View>)}
              {postcodeError != '' ? <Text style={{ color: 'red' }}>{postcodeError}</Text> : null}
            </View>
            <View style={{ paddingTop: 15 }} />
            <Text style={[FONTS.fontMedium, { fontSize: 14, color: colors.text, }]}>{t("street")}</Text>
            <Input
              inputBorder
              value={street}
              onChangeText={(value) => { setStreet(value); setStreetError(''); }}
              style={{ borderColor: mobileNumberError ? 'red' : COLORS.primaryLight, paddingLeft: 0 }}
              accessibilityLabel={t("street_input")}
            />
            {streetError ? <Text style={{ color: 'red' }}>{streetError}</Text> : null}
          </View>
        </ScrollView>)}
        {!isLoading && !loadError && (<View style={[GlobalStyleSheet.container, { padding: 0 }]}>
          <View
            style={{
              height: 88,
              width: '100%',
              backgroundColor: theme.dark ? 'rgba(255,255,255,.1)' : colors.card,
              justifyContent: 'center',
              paddingHorizontal: 15,
              shadowColor: "#000",
              shadowOffset: {
                width: 2,
                height: 2,
              },
              shadowOpacity: .1,
              shadowRadius: 5,
            }}
          >
            <Button
              title={t('save_address')}
              color={COLORS.secondary}
              text={COLORS.title}
              onPress={handleSaveAddress}
            />
          </View>
        </View>)}
      </View>
    </ErrorBoundary>
  );
};

export default AddDeliveryAddress;