import { COLORS, FONTS } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { View, Text, ScrollView, RefreshControl, ToastAndroid, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from 'react-native-paper';
const ErrorComponent = ({ message, onRetry }: { message: string, onRetry: () => void }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <Feather name="alert-circle" size={40} color={COLORS.danger} />
            <Text style={{ ...FONTS.h5, color: colors.title, marginTop: 15, textAlign: 'center' }}>
                {t('error')}
            </Text>
            <Text style={{ ...FONTS.font, color: colors.text, textAlign: 'center', marginVertical: 10 }}>
                {message}
            </Text>
            <Pressable
                onPress={onRetry}
                style={({ pressed }) => [styles.button, { backgroundColor: COLORS.primary, opacity: pressed ? 0.8 : 1, width: '50%' }]}
            >
                <Text style={[styles.buttonText, { color: COLORS.white }]}>{t('retry')}</Text>
            </Pressable>
        </View>
    );
};
export default ErrorComponent;
const styles = StyleSheet.create({
    button: {
        paddingVertical: 20,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});