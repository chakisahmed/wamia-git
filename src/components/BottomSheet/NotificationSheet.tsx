import { View, Text, TouchableOpacity, Image, Platform } from 'react-native'
import React, { useState } from 'react'
import { GlobalStyleSheet } from '@/constants/StyleSheet';
import { useNavigation, useTheme } from '@react-navigation/native';
import { COLORS, FONTS } from '@/constants/theme';
//import FeatherIcon from 'react-native-vector-icons/Feather';
import Button from '../Button/Button';
import ButtonOutline from '../Button/ButtonOutline';
import { Feather } from '@expo/vector-icons';
import { t } from 'i18next';
import * as Notifications from 'expo-notifications';

type Props = {
    moresheet2 ?: any;
}

const NotificationSheet = ({moresheet2} : Props) => {

    const theme = useTheme();
    const { colors } : {colors : any} = theme;

    const navigation = useNavigation<any>();

    const requestNotificationPermission = async () => {
        // Check current notification permission status
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        // If permission is not granted, ask for permission
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        // Handle the case if permission is still not granted
        if (finalStatus !== 'granted') {
            alert(t('notification_permission_denied'));  
            return;
        }

        // Get and log the push token if permission is granted
        const token = (await Notifications.getExpoPushTokenAsync()).data;
        return token;
    };

    return (
        <View style={[GlobalStyleSheet.container, { backgroundColor:theme.dark ? COLORS.title:COLORS.white,paddingTop:25, }]}>
            <TouchableOpacity
                style={{ height: 38, width: 38, backgroundColor: colors.card, borderRadius: 38,position:'absolute',right:0,top:10,alignItems:'center',justifyContent:'center' }}
                onPress={() => moresheet2.current.close()}
            >
                 <Feather size={20} color={colors.title} name={'x'} />
            </TouchableOpacity>
            <View style={{alignItems:'center'}}>
                <View style={{height:80,width:80,borderRadius:100,borderWidth:1,borderColor:COLORS.danger,alignItems:'center',justifyContent:'center'}}>
                     <Feather size={40} color={COLORS.danger} name={'bell'} />
                </View>
                <Text style={[FONTS.fontMedium,{fontSize:20,color:colors.title,marginTop:10}]}>{t('push_notifications')}</Text>
                <Text style={[FONTS.fontRegular,{fontSize:16,color:colors.text,textAlign:'center',marginTop:5}]}>{t('stay_informed')}</Text>
            </View>
            <View style={{marginVertical:15,marginTop:20}}>
                <Button
                    title={t('give_permission')}
                    color={COLORS.secondary}
                    text={COLORS.title}
                    onPress={async () => { 
                        
                        const token = await requestNotificationPermission();
                        moresheet2.current.close();
                        if(token)navigation.navigate('Notification');
                    }}
                />
            </View> 
            <View>
                <ButtonOutline
                    title={t('later_take_me_back')}
                    color={COLORS.primaryLight}
                    text={COLORS.primary}
                    onPress={() => moresheet2.current.close()}
                />
            </View>
        </View>
    )
}

export default NotificationSheet