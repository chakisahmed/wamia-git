// SnackBar.js

import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { COLORS } from '@/constants/theme';
import { t } from 'i18next';
import { Feather } from '@expo/vector-icons';
// If you want an icon, you can install react-native-vector-icons:
//   npm install react-native-vector-icons
// Then import and use the icon like below:
// import Icon from 'react-native-vector-icons/MaterialIcons';

const SnackBar = ({
  visible = false,
  message = 'Item added to cart',
  onContinue = () => {},
  onViewCart = () => {},
}) => {
  // If not visible, return null
  const translateY = useRef(new Animated.Value(100)).current;
  useEffect(() => {
    if (visible) {
      // Slide in animation
      Animated.timing(translateY, {
        toValue: 0, // Move into view
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Slide out animation
      Animated.timing(translateY, {
        toValue: 300 , // Move out of view
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);




  return (
    <Animated.View style={[styles.snackBarContainer, { transform: [{ translateY }] }]}>
      <View style={styles.snackBarContent}>
        {/* Example icon: uncomment if using react-native-vector-icons */}
        {/* <Icon name="check-circle" size={24} color="#4CAF50" style={styles.icon} /> */}
        <View style={styles.labelContainer}>
        <Text style={styles.snackBarText}>{message}</Text>
        <Text style={styles.successTag}>{t('added_to_cart')}</Text>
        </View>
        <View
                            style={{
                                height:32,
                                width:32,
                                backgroundColor:COLORS.success,
                                borderRadius:32,
                                marginLeft:10,
                                marginTop:5,
                                
                                alignItems:'center',
                                justifyContent:'center',
                            }}
                        >
                            {/* <Feather size={32} color={COLORS.white} name="check"/> */}
                            <Feather size={24} color={COLORS.white} name="check"/>
                        </View>
      </View>
   
      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.button, styles.continueShoppingButton]} onPress={onContinue}>
          <Text style={[styles.buttonText,{color: COLORS.deepOrange,}]}>{t("continue_shopping").toUpperCase()}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.viewCartButton]} onPress={onViewCart}>
          <Text style={[styles.buttonText,{color: 'white',}]}>{t("view_cart").toUpperCase()}</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default SnackBar;

const styles = StyleSheet.create({
  snackBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    paddingVertical: 16,
    paddingHorizontal: 16,

    // Elevation/shadow
    elevation: 5, // Android
    shadowColor: '#000', // iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,

    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,

    // If you want a more snug “snackbar,” you can set a fixed height or reduce padding
  },
    labelContainer: {
        flexDirection: 'column',
        marginBottom: 8,
        width: '88%',
    },
  snackBarContent: {
    flexDirection: 'row',
    marginBottom: 8,
    width: '100%',
  },
  successTag:{
    color: 'green',
    textAlign: 'right',
    width: '100%',
    fontSize: 16,
    fontWeight: 'bold',

  },
  icon: {
    marginRight: 8,
  },
  snackBarText: {
    fontSize: 16,
    textAlign: 'right',
    width: '100%',
    color: '#333',
    flexShrink: 1, // So text wraps if it's too long
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'column', // changed from 'row'  
    alignItems: 'stretch',
    fontWeight: 'bold',
  },
  button: {
    
    
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 8, // adds vertical spacing between buttons
    borderRadius: 6,

  },
  continueShoppingButton: {
    borderWidth: 2,
    backgroundColor: 'white',
    borderColor: COLORS.deepOrange,
    borderBlockColor: COLORS.deepOrange,
    
  },
  viewCartButton: {
    backgroundColor: COLORS.deepOrange,
  },
  buttonText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold',
    padding: 4,
  },
});