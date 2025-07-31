import { View, Text, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { useTheme } from '@react-navigation/native';
import { COLORS, FONTS } from '@/constants/theme';
//import FeatherIcon from 'react-native-vector-icons/Feather';
import { Feather } from '@expo/vector-icons';
import Accordion from 'react-native-collapsible/Accordion';
import { t } from 'i18next';

const QuestionsAccordion = () => {

    const theme = useTheme();
    const { colors } : {colors : any} = theme;

    const [activeSections, setActiveSections] = useState([0]);
    const setSections = (sections:any) => {
        setActiveSections(
            sections.includes(undefined) ? [] : sections
        );
    };

    const SECTIONS = [
        {
            title: t("faq_customer_service_1_question"),
            content: t("faq_customer_service_1_answer"),
        },
        {
            title: t("faq_customer_service_2_question"),
            content: t("faq_customer_service_2_answer"),
        },
        {
            title: t("faq_customer_service_3_question"),
            content: t("faq_customer_service_3_answer"),
        },
        {
            title: t("faq_customer_service_4_question"),
            content: t("faq_customer_service_4_answer"),
        },
        {
            title: t("faq_customer_service_5_question"),
            content: t("faq_customer_service_5_answer"),
        },
    ];

    const AccordionHeader = (item:any, _:any, isActive:any) => {

        return (
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 15
            }}>
                <Text style={[FONTS.fontMedium, { fontSize: 14, color: colors.title, flex: 1 }]}>{item.title}</Text>
                {/* <Feather name={isActive ? "chevron-up" : "chevron-down"} size={18} color={colors.title} /> */}
                <Feather size={24} color={colors.title} name={isActive ? "chevron-up" : "chevron-down"} />
            </View>
        )
    }

    const AccordionBody = (item:any, _:any, isActive:any) => {
        return (
            <View style={{
                borderTopWidth: 1,
                borderTopColor: colors.border,
                paddingVertical: 10,
                paddingHorizontal: 15
            }}>

                <Text style={[FONTS.fontSm, { color: colors.text, lineHeight: 20 }]}>{item.content}</Text>
            </View>
        )
    }

    return (
        <>
            <Accordion
                sections={SECTIONS}
                duration={300}
                sectionContainerStyle={{
                    // borderWidth: 1,
                    // borderColor: theme.dark ? COLORS.white : colors.borderColor,
                    marginBottom: 10,
                    //paddingHorizontal: 20,
                    borderRadius: 10,
                    backgroundColor:theme.dark ? 'rgba(255,255,255,.1)':colors.card
                }}
                activeSections={activeSections}
                onChange={setSections}
                touchableComponent={TouchableOpacity}
                renderHeader={AccordionHeader}
                renderContent={AccordionBody}
            />
        </>
    );
}

export default QuestionsAccordion