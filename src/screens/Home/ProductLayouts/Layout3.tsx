// src/components/ProductLayouts/Layout3.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { GlobalStyleSheet } from '@/constants/StyleSheet';
import { FONTS, COLORS } from '@/constants/theme';
import StopWatch2 from '@/components/StopWatch2';
import { useTheme } from '@react-navigation/native';
// If you already have a ProductLayout3 component, import it:
import ProductLayout3 from '@/screens/Home/ProductLayout3';
import { useTranslation } from 'react-i18next';

interface Layout3Props {
  layout: {
    dateRange: [string, string];
    data: any[];
  };
}

const Layout3: React.FC<Layout3Props> = ({ layout }) => {
  const { colors, dark } = useTheme();
  const { t } = useTranslation();

  // Calculate the duration (in seconds) between the start and end dates
  const duration = Math.floor(
    (new Date(layout.dateRange[1]).getTime() - new Date(layout.dateRange[0]).getTime()) / 1000
  );

  return (
    <>
      {layout.dateRange[0] && layout.dateRange[1] && (
        <View
          style={[
            GlobalStyleSheet.container,
            {
              paddingHorizontal: 20,
              backgroundColor: dark ? 'rgba(255,255,255,0.1)' : colors.card,
              borderBottomWidth: 1,
              borderBottomColor: COLORS.primaryLight,
              paddingVertical: 10,
            },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={[FONTS.fontMedium, { fontSize: 18, color: colors.title }]}>{t('blockbuster_deals')}</Text>
            <View>
              <Text style={[FONTS.fontRegular, { fontSize: 12, color: colors.text, textAlign: 'right' }]}>{t('offer_ends_in')}</Text>
              <StopWatch2 seconds={duration} />
            </View>
          </View>
        </View>
      )}
      {/* Render your product grid – here we delegate to an existing ProductLayout3 component */}
      <ProductLayout3 data={layout.data} />
    </>
  );
};

export default Layout3;
