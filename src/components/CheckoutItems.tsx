// app/components/CheckoutItems.tsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ToastAndroid } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { COLORS, FONTS } from '../constants/theme';
import { useDispatch, useSelector } from 'react-redux';
import { updateItemInCart } from '@/redux/slices/cartSlice';
import { t } from 'i18next';
import { RootState } from '@/redux/store';
import { CartItem } from '@/api/cartApi';
import debounce from 'lodash.debounce';

type Props = {
  cartItem?: CartItem;
};

const CheckoutItems = ({ cartItem }: Props) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { colors }: { colors: any } = theme;
  const token = useSelector((state: RootState) => state.auth.userToken);

  // --- SOLUTION ---
  // 1. Use local state for the quantity displayed in the UI.
  // This gives the user instant feedback.
  const [displayQty, setDisplayQty] = useState(cartItem?.qty || 0);

  // 2. Synchronize the local state if the prop from Redux changes.
  // This happens on initial load or if the cart is updated elsewhere.
  useEffect(() => {
    if (cartItem?.qty !== undefined) {
      setDisplayQty(cartItem.qty);
    }
  }, [cartItem?.qty]);

  // The actual handler that dispatches to Redux.
  // Wrapped in useCallback so it's stable, its dependencies are also stable.
  const handleUpdateItemInCart = useCallback((newQty: number) => {
    try {
      if (!cartItem?.item_id || cartItem.item_id.toString().includes("temp-")) return;
      //if (!token) return; // Safety check

      const payload = {
        item_id: cartItem.item_id,
        qty: newQty,
      };
      // Dispatch the thunk with the final quantity
      dispatch(updateItemInCart({ cartItem: payload, token }));

    } catch (error) {
      console.error('Error updating cart:', error);
      const msg = t("unavailable_quantity");
      ToastAndroid.show(msg, ToastAndroid.SHORT);
      // On error, revert the display quantity back to the "source of truth" from Redux
      if (cartItem?.qty) {
        setDisplayQty(cartItem.qty);
      }
    }
  }, [dispatch, token, cartItem?.item_id]); // Stable dependencies


  // 3. Create the debounced function ONCE using useMemo with a stable dependency.
  // This function will now persist across re-renders caused by setDisplayQty.
  // We use a "trailing" debounce, which is standard for this use case.
  const debouncedUpdateCart = useMemo(
    () => debounce(handleUpdateItemInCart, 500), // 500ms delay, trailing (default)
    [handleUpdateItemInCart] // The handler is stable now
  );

  // 4. Clean up the debounced function on unmount to prevent memory leaks.
  useEffect(() => {
    return () => {
      debouncedUpdateCart.cancel();
    };
  }, [debouncedUpdateCart]);


  const handleIncrement = () => {
    const newQty = displayQty + 1;
    setDisplayQty(newQty); // Update UI instantly
    debouncedUpdateCart(newQty); // Schedule the API call
  };

  const handleDecrement = () => {
    const newQty = displayQty - 1;
    setDisplayQty(newQty); // Update UI instantly
    debouncedUpdateCart(newQty); // Schedule the API call
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <TouchableOpacity
      disabled = {displayQty==1}
        onPress={handleDecrement}
        style={{
          height: 30,
          width: 30,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Feather size={20} color={displayQty>1?colors.text: COLORS.gray} name={'minus'} />
      </TouchableOpacity>
      <Text
        style={{
          ...FONTS.fontRegular,
          fontSize: 14,
          color: colors.title,
          width: 50,
          textAlign: 'center',
        }}
      >
        {displayQty}
      </Text>
      <TouchableOpacity
        onPress={handleIncrement}
        style={{
          height: 30,
          width: 30,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Feather size={20} color={colors.text} name={'plus'} />
      </TouchableOpacity>
    </View>
  );
};

export default CheckoutItems;