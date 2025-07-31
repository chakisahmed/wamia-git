import React, { useState } from 'react'
import { View, Text,  ScrollView, Image } from 'react-native'
import { useNavigation, useRoute, useTheme } from '@react-navigation/native';
import Header from '@/layout/Header';
import { GlobalStyleSheet } from '@/constants/StyleSheet';
import Input from '@/components/Input/Input';
//import { Feather } from '@expo/vector-icons';
import Button from '@/components/Button/Button';
import { COLORS, FONTS } from '@/constants/theme';
import { useDispatch, useSelector } from 'react-redux';
import { updateCustomerDetails } from '@/api/customerApi';
import { RootState } from '@/redux/store/auth';
import { useTranslation } from 'react-i18next';
import {setUser as setUserAction} from '@/redux/slices/authSlice';
import { ErrorBoundary } from '@/components/ErrorBoundary';
const EditProfile = () => {
    const route= useRoute();
    const { onGoBack } = route.params as { onGoBack: (address: any) => void };
    const theme = useTheme();
    const { colors } : {colors : any} = theme;
    const [email , setEmail] = useState('');
    const [newPassword , setNewPassword] = useState('');
    const [confirmPassword , setConfirmPassword] = useState('');
    const [fullName , setFullName] = useState('');
    const navigation = useNavigation<any>();
    const userToken = useSelector((state: RootState) => state.auth.userToken);
    const user = useSelector((state: RootState) => state.auth.user);
    const { t } = useTranslation();
    const dispatch = useDispatch();


    const [isFocused , setisFocused] = useState(false);
    const [isFocused1 , setisFocused1] = useState(false);
    const [isFocused2 , setisFocused2] = useState(false);
    const [isFocused3 , setisFocused3] = useState(false);

    async function handleUpdateProfile (): Promise<void> {
        if(newPassword !== confirmPassword){
            return;
        }
        var payload = {
            customer:{
                email:email,
                firstname:fullName.split(' ')[0],
                lastname:fullName.split(' ')[1],
            }
        }

        if(newPassword !== ''){
            payload = {
                ...payload,
                password:newPassword
            }
        }
        const response = await updateCustomerDetails(payload);
        if(response){
            dispatch(setUserAction(response));
            onGoBack(response);
            navigation.goBack();
        }
    }

    return (
        <ErrorBoundary>
       <View style={{backgroundColor:colors.background,flex:1}}>
           <Header
                title={t('edit_profile')}
                leftIcon='back'
                titleRight
           />
            <ScrollView contentContainerStyle={{flex:1}}>
                <View style={[GlobalStyleSheet.container, {backgroundColor:theme.dark ? 'rgba(255,255,255,.1)':colors.card}]}>
                    <View style={{flexDirection:'row',alignItems:'center',gap:20}}>
                        <View style={{}}>
                            <View style={{ borderWidth: 2, borderColor:COLORS.primary, height: 90, width: 90, borderRadius: 50, alignItems: 'center', justifyContent: 'center' }}>
                                <Image
                                    style={{ height: 82, width: 82, borderRadius: 50 }}
                                    source={{uri:"https://www.wamia.tn/media/catalog/product/placeholder/default/ph_base.jpg"}}
                                />
                            </View>
                        </View>
                        <View>
                            <Text style={[FONTS.fontMedium,{fontSize:24,color:colors.title}]}>{user!=null?user.firstname+" "+user.lastname:" Guest User"}</Text>
                        </View>
                    </View>
                </View>
                <View style={[GlobalStyleSheet.container,{backgroundColor:theme.dark ? 'rgba(255,255,255,.1)':colors.card,marginTop:10,paddingVertical:10}]}>
                    <View style={{ marginBottom: 20, marginTop: 10 }}>
                        <Text style={{ ...FONTS.fontMedium, fontSize: 13, color:COLORS.primary, }}>{t('full_name')}</Text>
                        <Input
                             onFocus={() => setisFocused(true)}
                             onBlur={() => setisFocused(false)}
                             isFocused={isFocused}
                            inputBorder
                            defaultValue={user!=null?user.firstname+" "+user.lastname:""}
                            onChangeText={(value) => {
                                setFullName(value);
                            }}
                            style={{borderColor:COLORS.primaryLight, paddingLeft:0}}
                        />
                    </View>

                    <View style={{ marginBottom: 15 }}>
                        <Input
                             onFocus={() => setisFocused2(true)}
                             onBlur={() => setisFocused2(false)}
                             isFocused={isFocused2}
                            inputBorder
                            defaultValue={user!=null?user.email:""}
                            placeholder={t('email')}
                            onChangeText={(value) => {}}
                            style={{borderColor:COLORS.primaryLight, paddingLeft:0}}
                        />
                    </View>
                    <View style={{paddingTop:10}}>
                        <Text style={{ ...FONTS.fontMedium, fontSize: 13, color:COLORS.primary, marginBottom: 10 }}>{t('change_password')}</Text>
                    </View>

                <View style={{ marginBottom: 15 }}>
                    <Input
                        onFocus={() => setisFocused3(true)}
                        onBlur={() => setisFocused3(false)}
                        isFocused={isFocused3}
                        inputBorder
                        placeholder={t('new_password')}
                        secureTextEntry={true}
                        onChangeText={(value) => {
                            setNewPassword(value);
                        }}
                        style={{borderColor:COLORS.primaryLight, paddingLeft:0}}
                    />

                </View>

                <View style={{ marginBottom: 15 }}>
                    <Input
                        onFocus={() => setisFocused3(true)}
                        onBlur={() => setisFocused3(false)}
                        isFocused={isFocused3}
                        inputBorder
                        placeholder={t('confirm_new_password')}
                        secureTextEntry={true}
                        onChangeText={(value) => {
                            setConfirmPassword(value);
                        }}
                        style={{borderColor:COLORS.primaryLight, paddingLeft:0}}
                    />

                </View>
                </View>
            </ScrollView>
            <View style={[GlobalStyleSheet.container,{paddingHorizontal:0,paddingBottom:0}]}>
                <View style={{height:88,width:'100%',backgroundColor:theme.dark ? 'rgba(255,255,255,.1)':colors.card,justifyContent:'center',paddingHorizontal:15}}>
                    <Button
                        title={t('update_profile')}
                        color={COLORS.secondary}
                        text={ COLORS.title}
                        onPress={handleUpdateProfile}
                    />
                </View>
            </View> 
       </View></ErrorBoundary>
    )
}

export default EditProfile