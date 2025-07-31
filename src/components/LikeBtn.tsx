import React, { useState, useEffect } from 'react';
import { Pressable, ToastAndroid } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useTheme } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { t } from 'i18next';

interface LikeBtnProps {
    isLiked: boolean;
    onPress: () => void;
    size?: number;
    disabled?: boolean;
}

const LikeBtn = ({ isLiked, onPress, size, disabled }: LikeBtnProps) => {
    const theme = useTheme();
    const { colors }: { colors: any } = theme;

    // This state is now purely for the optimistic UI update.
    const [optimisticLiked, setOptimisticLiked] = useState(isLiked);
    const token = useSelector((state:RootState)=>state.auth.userToken)

    // This effect synchronizes the local state with the prop from the parent.
    // It runs whenever the "true" isLiked status changes (e.g., after the API call completes).
    useEffect(() => {
        setOptimisticLiked(isLiked);
    }, [isLiked]);

    const handlePress = () => {
        // 1. Immediately update the UI optimistically.
        if(!token){
            ToastAndroid.show(t("please_login_to_use_your_wishlist"), ToastAndroid.SHORT);
            return;}
        setOptimisticLiked(prevLiked => !prevLiked);

        // 2. Call the passed-in onPress function to trigger the actual API call.
        // We don't need a try/catch here for the UI, as the useEffect will handle rollbacks.
        onPress();
    };

    return (
        <Pressable
            accessible={true}
            accessibilityLabel="Like Button"
            onPress={handlePress}
            disabled={disabled}
            style={{
                height: 50,
                width: 50,
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <FontAwesome
                size={size ?? 16}
                // The UI now reliably uses the optimistic state.
                color={optimisticLiked ? COLORS.danger : (theme.dark ? colors.primaryLight : colors.text)}
                style={{ opacity: optimisticLiked ? 1 : 0.85 }}
                name={optimisticLiked ? "heart" : "heart-o"}
            />
        </Pressable>
    );
}

export default LikeBtn;