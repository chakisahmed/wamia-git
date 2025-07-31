import { View } from 'react-native';
import React, { useState } from 'react';
import { useTheme } from '@react-navigation/native';
import { CountryButton, CountryPicker } from 'react-native-country-codes-picker';
import { COLORS } from '../constants/theme';

interface SelectCountryProps {
    onSelect: (country: { code: string; dial_code: string }) => void;
}

const SelectCountery: React.FC<SelectCountryProps> = ({ onSelect }) => {
  const theme = useTheme();
  const { colors }: { colors: any } = theme;

  const [show, setShow] = useState(false);
  const [countryCode, setCountryCode] = useState('');
  const [countryflag, setCountryflag] = useState('');
  const [countryName, setCountryName] = useState('');
  const [countryDialCode, setCountryDialCode] = useState('');

  return (
    <View>
      <CountryButton 
        onPress={() => setShow(true)}
        item={{
          dial_code: countryDialCode ? countryDialCode : "+216", 
          code: countryCode ? countryCode : "TN",
          flag: countryflag ? countryflag : "🇹🇳",
          name: countryName ? countryName : "Tunisia",
        }}
        style={{
          countryButtonStyles: {
            height: 20,
            backgroundColor: 'transparent',
            width: 65,
            paddingHorizontal: 0,
            paddingVertical: 0,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 0,
          },
          dialCode: {
            flex: 1,
            color: colors.title,
          },
          flag: {
            flex: 0,
            width: 20,
            marginRight: 5,
          },
          countryName: {
            display: 'none',
          },
        }}
      />
      <CountryPicker
        show={show}
        pickerButtonOnPress={(item) => {
          setCountryflag(item.flag);
          setCountryCode(item.dial_code);
          setShow(false);
          onSelect(item);
        }}
        style={{
          modal: {
            height: 500,
            backgroundColor: theme.dark ? 'rgba(255,255,255,0.6)' : COLORS.card,
          },
          countryButtonStyles: {
            backgroundColor: theme.dark ? colors.background : colors.input,
          },
          dialCode: {
            color: colors.title,
          },
          countryName: {
            color: colors.title,
          },
          textInput: {
            color: COLORS.title,
          },
        }}
      />
    </View>
  );
};

export default SelectCountery;