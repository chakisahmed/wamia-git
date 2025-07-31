import { View, ActivityIndicator,Text } from "react-native";
import { useTheme } from "react-native-paper";

const LoadingComponent = () => {
    const { colors } = useTheme();
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ marginTop: 10, color: colors.text }}>Loading Cart...</Text>
        </View>
    );
};
export default LoadingComponent;
