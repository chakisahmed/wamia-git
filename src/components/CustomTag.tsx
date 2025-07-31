import { COLORS } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from 'react-native-paper';

// Define the component, accepting props like text, style, and which side to round
interface CustomTagParams { text?: string, style: any, code: string,roundedSide: string }
const CustomTag = ({ text, style, code, roundedSide = 'left' }: CustomTagParams) => {
    const theme = useTheme()

    // Define base styles
    const baseStyle = {
        backgroundColor: code=="16500"?"#35c162":COLORS.secondary,
        paddingVertical: 5,
        paddingHorizontal: 10,
        alignSelf: 'flex-start',
    };

    // Define corner styles based on the 'roundedSide' prop
    const cornerStyles =
        roundedSide === 'left'
            ? {
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 15,
                borderTopRightRadius: 50,
                borderBottomRightRadius: 50,
            }
            : {
                borderTopLeftRadius: 50,
                borderBottomLeftRadius: 50,
                borderTopRightRadius: 0,
                borderBottomRightRadius: 15,
            };

    return (
        <View style={[baseStyle, cornerStyles, style]}>
            <Text style={[styles.tagText,{color:theme.dark?'black':'white',}]}>{text ?? (code=="16500"? "Express 24-48h": "Market 48-72h")}</Text>
        </View> 
    );
};

const styles = StyleSheet.create({
    tagText: {
        fontWeight: 'bold',
        fontSize: 10,
    },
});

export default CustomTag;