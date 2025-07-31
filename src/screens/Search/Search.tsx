import { useNavigation, useTheme } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react'
import { View, Text, TouchableOpacity, TextInput, ScrollView, Image, ToastAndroid } from 'react-native'
import { GlobalStyleSheet } from '@/constants/StyleSheet';
import { Feather } from '@expo/vector-icons';
import { COLORS, FONTS } from '@/constants/theme';
import { IMAGES } from '@/constants/Images';
import { fetchCategories, fetchCategory } from '@/api/categoriesApi';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCategories } from '@/hooks/categoriesHook';



const Search = ({ navigation }: any) => {

    const theme = useTheme();
    const { colors }: { colors: any } = theme;
    const { t } = useTranslation();

    const [searchTerm, setSearchTerm] = useState('');
    const [searchHistory, setSearchHistory] = useState<{ title: string }[]>([]);
    const { categoriesData, loading } = useCategories({ parentId: "2" })

    useEffect(() => {

        const controller = new AbortController();
        const signal = controller.signal;
        const getSearchHistory = async () => {
            try {
                const history = await AsyncStorage.getItem('searchHistory');
                if (!signal.aborted) {
                    if (history) {
                        setSearchHistory(JSON.parse(history));
                    }

                }

            } catch (error) {

                if (error.name === 'AbortError') {

                } else {
                    ToastAndroid.show(t("error"), ToastAndroid.SHORT)
                }
            }
        }

        getSearchHistory();

        return () => {
            controller.abort();
        };

    }, []);

    const removeItem = async () => {
            await AsyncStorage.removeItem("searchHistory")
            setSearchHistory([])
    };

    return (
        <View style={{ backgroundColor: colors.background, flex: 1 }}>
            <View style={[GlobalStyleSheet.container, { height: 60, backgroundColor: theme.dark ? 'rgba(255,255,255,.1)' : colors.card, justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.primaryLight }]}>
                <View style={[GlobalStyleSheet.row, {}]}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={{
                            borderRadius: 8,
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Feather size={24} color={colors.text} name={'arrow-left'} />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                        <TextInput
                            placeholder={t('search_products')}
                            placeholderTextColor={colors.text}
                            style={[FONTS.fontRegular, {
                                height: 48,
                                width: '100%',
                                borderColor: colors.border,
                                borderRadius: 8,
                                paddingHorizontal: 20,
                                color: colors.title,
                                fontSize: 16,
                            }]}
                            onChangeText={(text) => setSearchTerm(text)}
                            onSubmitEditing={async () => {
                                let newHistory = searchHistory.filter(item => item.title !== searchTerm);
                                newHistory = [{ title: searchTerm }, ...newHistory];
                                await AsyncStorage.setItem('searchHistory', JSON.stringify(newHistory));
                                setSearchHistory(newHistory);

                                navigation.navigate('Products', { searchTerm });
                            }}
                        />
                    </View>
                </View>
            </View>
            <View style={[GlobalStyleSheet.container, { paddingTop: 0 }]}>
                <View style={{}}>
                    <View style={{ backgroundColor: theme.dark ? 'rgba(255,255,255,.1)' : colors.card, marginHorizontal: -15, paddingHorizontal: 15, marginBottom: 15 }}>
                        {searchHistory.slice(0, 20).map((data, index) => {
                            return (
                                <TouchableOpacity
                                    activeOpacity={0.5}
                                    onPress={() => navigation.navigate('Products', { searchTerm: data.title })}
                                    key={index}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        paddingVertical: 15,
                                        borderBottomWidth: 1,
                                        borderBottomColor: COLORS.primaryLight
                                    }}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                        <Image
                                            style={{ height: 20, width: 20, resizeMode: 'contain' }}
                                            source={IMAGES.timer}
                                        />
                                        <Text style={[FONTS.fontRegular, { fontSize: 18, color: colors.title }]}>{data.title}</Text>
                                    </View>
                                    <View>
                                        <Feather size={24} color={colors.text} name={'arrow-up-right'} />
                                    </View>
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                    {categoriesData.items.length > 0 &&
                        <View>
                            <View style={[GlobalStyleSheet.row, { alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.dark ? 'rgba(255,255,255,.1)' : colors.card, marginHorizontal: -15, paddingHorizontal: 15, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: COLORS.primaryLight }]}>
                                <Text style={[FONTS.fontMedium, { fontSize: 16, color: colors.title }]}>{t('discover_more')}</Text>
                                <TouchableOpacity
                                    onPress={() => removeItem()}
                                    activeOpacity={0.5}
                                >
                                    <Text style={[FONTS.fontRegular, { fontSize: 12, color: COLORS.primary }]}>{t('clear_all')}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', backgroundColor: theme.dark ? 'rgba(255,255,255,.1)' : colors.card, marginHorizontal: -15, paddingHorizontal: 15, paddingVertical: 20 }}>
                                {categoriesData.items.map((data, index: number) => {
                                    return (
                                        <TouchableOpacity key={index} style={{ paddingVertical: 5, borderWidth: 1, paddingHorizontal: 15, borderColor: COLORS.primaryLight, marginBottom: 5, marginRight: 5 }}
                                            onPress={async () => {
                                                try {
                                                    const category = await fetchCategory(data.id);
                                                    navigation.navigate('Products', { category: category.items[0] });

                                                } catch (error) {
                                                    console.error('Error fetching category:', error);
                                                }
                                            }}
                                        >
                                            <Text style={{ ...FONTS.fontRegular, fontSize: 15, color: colors.title }}>{data.name}</Text>
                                        </TouchableOpacity>
                                    )
                                })}
                            </View>
                        </View>
                    }
                </View>
            </View>
        </View>
    )
}

export default Search