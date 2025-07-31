// src/components/Home/HomeHeader.tsx
import React, { forwardRef, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { GlobalStyleSheet } from '@/constants/StyleSheet';
import { IMAGES } from '@/constants/Images';
import { FONTS, COLORS } from '@/constants/theme';
import { useDispatch } from 'react-redux';
import * as Notifications from 'expo-notifications';



const HomeHeader = forwardRef(({ tags, openDrawer, navigation }, ref) => {
    const { colors } = useTheme();
    const dispatch = useDispatch();
    const theme = useTheme();

    return (
        <>
            <View style={{ height: 60, backgroundColor: COLORS.primary }}>
                <View style={[GlobalStyleSheet.container, { paddingHorizontal: 20 }]}>
                    <View style={[GlobalStyleSheet.row, { alignItems: 'center', justifyContent: 'space-between' }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <TouchableOpacity
                                style={{ margin: 5 }}
                                onPress={() => dispatch(openDrawer())}
                            >  
                                <Image
                                    style={{ height: 22, width: 22, tintColor: COLORS.card, resizeMode: 'contain' }}
                                    source={IMAGES.grid5}
                                />
                            </TouchableOpacity>
                            <Image
                                style={{ resizeMode: 'cover', height: 120, width: 120, aspectRatio: 5, marginBottom: 3 }}

                                source={IMAGES.appname}
                            />
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Search')}
                                style={{
                                    height: 35,
                                    width: 35,
                                    // borderRadius:8,
                                    // backgroundColor:theme.dark ? 'rgba(255,255,255,0.10)' : COLORS.background,
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Image
                                    style={{ height: 22, width: 22, tintColor: COLORS.card, resizeMode: 'contain' }}
                                    source={IMAGES.search}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                //onPress={() => navigation.navigate('Notification')}
                                onPress={async () => {
                                    const { status: existingStatus } = await Notifications.getPermissionsAsync();
                                    if (existingStatus !== 'granted') {
                                        ref.current.openSheet('notification')
                                    }
                                    else {
                                        navigation.navigate('Notification')
                                    }

                                }
                                }

                                style={{
                                    height: 35,
                                    width: 35,
                                    // borderRadius:8,
                                    // backgroundColor:theme.dark ? 'rgba(255,255,255,0.10)' : COLORS.background,
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Image
                                    style={{ height: 20, width: 20, tintColor: COLORS.card, resizeMode: 'contain' }}
                                    source={IMAGES.ball}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
            {tags.length > 0 && <View style={{ height: 40, backgroundColor: theme.dark ? "rgba(255,255,255,0.2)" : colors.card, marginBottom: 10 }}>
                <View style={[GlobalStyleSheet.container, { padding: 10, paddingHorizontal: 0 }]}>
                    <View>
                        <ScrollView
                            horizontal
                            contentContainerStyle={{ paddingHorizontal: 20, flexGrow: 1 }}
                            showsHorizontalScrollIndicator={false}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20, }}>
                                {tags.map((data, index) => {
                                    return (
                                        <TouchableOpacity
                                            onPress={async () => {
                                                navigation.navigate('Products', { category: { id: data.category_id }, page_name: data.name })
                                            }}
                                            key={index}
                                        >
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                                {data.image ?
                                                    <Image
                                                        style={{ height: 16, width: 16, resizeMode: 'contain' }}
                                                        source={{ uri: data.image }}
                                                    />
                                                    :
                                                    null
                                                }
                                                <Text style={[FONTS.fontMedium, { fontSize: 13, color: colors.title }]}>{data.name}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    )
                                })}
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </View>}
        </>
    );
});

export default HomeHeader;
