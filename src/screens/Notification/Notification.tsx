import { useNavigation, useTheme } from '@react-navigation/native';
import React, { useEffect, useState } from 'react'
import { View, Text,ScrollView,TouchableOpacity, LayoutAnimation, Image } from 'react-native'
import Header from '@/layout/Header';
import { IMAGES } from '@/constants/Images';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import SwipeBox from '@/components/SwipeBox';
import { GlobalStyleSheet } from '@/constants/StyleSheet';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import Cardstyle1 from '@/components/Card/Cardstyle1';
import { useDispatch } from 'react-redux';
import { addProductToWishlist } from '@/redux/slices/wishListSlice';
import { fetchBestSellerProducts } from '@/api/homeService';
import { t } from 'i18next';


const PopoulerData = [  
    {
        title: "all",
        active:true
    },
    {
        title: "offer",
        image:IMAGES.offer
    },
    {
        title: "crazy_deals",
        image:IMAGES.fire,
    },
    {
        title: "deal_of_the_day",
    },
]





const SwipeData = [
    {
        image: IMAGES.new_icon,  
        title: t('recent_products'),    
        otherFilters: '',
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    },
    {
        image: IMAGES.wamia,
        otherFilters: 'category_id:{eq:"2956"}',
        title: t('promotions'),
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    },
]

const Notification = () => {

    const theme = useTheme();
    const { colors } : {colors : any} = theme;
    const [bestSellerData, setBestSellerData] = useState<any>([]);

    const navigation = useNavigation<any>();

    const [lists, setLists] = useState<any>(SwipeData);

    useEffect(() => {
        const loadData = async () => { 
            const bestSellerData = await fetchBestSellerProducts();
            setBestSellerData(bestSellerData);
         }
        loadData();
    }, [])

    const deleteItem = (index:any) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.spring)
        const arr = [...lists];
        arr.splice(index, 1);
        setLists(arr);
    };





    const dispatch = useDispatch();


    const addItemToWishList = (data: any) => {
        dispatch(addProductToWishlist(data));
        }

    return (
        <View style={{backgroundColor:theme.dark ? colors.background :colors.card,flex:1}}>
            <Header
                title='Notifications (12)'
                leftIcon='back'
                rightIcon1={'search'}
            />
            <View 
                style={{
                    height:40,
                    backgroundColor:theme.dark ? 'rgba(255,255,255,.1)':colors.card,
                    shadowColor: "#000",
                    shadowOffset: {
                        width: 0,
                        height: 4,
                    },
                    shadowOpacity: 0.35,
                    shadowRadius: 6.27,
                    elevation: 5, 
                }}
            >
                <View style={[GlobalStyleSheet.container,{padding:10,paddingHorizontal:0}]}>
                    <View>
                        <ScrollView
                            horizontal
                            contentContainerStyle={{paddingHorizontal:20,flexGrow:1}}
                            showsHorizontalScrollIndicator={false}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20, }}>
                                {PopoulerData.map((data:any,index) => {
                                    return(
                                        <TouchableOpacity
                                            activeOpacity={0.9} 
                                            key={index}
                                        >
                                            <View style={{flexDirection:'row',alignItems:'center',gap:5}}>
                                                {data.image ? 
                                                    <Image
                                                        style={{height:16,width:16,resizeMode:'contain'}}
                                                        source={data.image}
                                                    />
                                                :null}
                                                <Text style={[FONTS.fontMedium,{fontSize:15,color:data.active ? COLORS.primary :colors.title}]}>{t(data.title)}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    )
                                })}
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </View>
            <ScrollView contentContainerStyle={{paddingBottom:50}}>
                <View style={[GlobalStyleSheet.container,{padding:0,paddingBottom:10}]}>
                    <GestureHandlerRootView style={{}}>
                            {lists.map((data:any,index:any) => {
                                return(
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => {
                                            navigation.navigate('Products', { otherFilters:data.otherFilters, page_name:t(data.title) });
                                        }}
                                    >
                                        <SwipeBox data={data} colors={colors} handleDelete={() => deleteItem(index)} />
                                    </TouchableOpacity>
                                )
                            })}
                    </GestureHandlerRootView>
                </View>
                <View style={[GlobalStyleSheet.container,{paddingHorizontal:20,backgroundColor:colors.card,borderBottomWidth:1,borderBottomColor:COLORS.primaryLight,paddingVertical:15,paddingTop:5}]}>
                    <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
                        <Text style={[FONTS.fontMedium,{fontSize:18,color:colors.title}]}>{t('best_sellers')}</Text>
                    </View>
                </View>
                <View style={[GlobalStyleSheet.container,{padding:0,borderBottomWidth:1,borderBlockColor:COLORS.primaryLight}]}>
                    <ScrollView 
                        horizontal
                        showsHorizontalScrollIndicator={false}
                    >
                        <View style={{flexDirection:'row',alignItems:'center',justifyContent:'center'}}>
                            {bestSellerData.map((item:any, index:number) => {
                                const discount = item.price_range.maximum_price.regular_price.value - item.price_range.maximum_price.final_price.value;
                                const discountPercentage = Math.floor((discount / item.price_range.maximum_price.regular_price.value) * 100);
                                return (      
                                    <View style={[{ marginBottom: 0, width: SIZES.width > SIZES.container ? SIZES.container / 3 : SIZES.width / 2.3 }]} key={index}>
                                        <Cardstyle1
                                                id={item.id}
                                                data={item}
                                                sku={item.sku}
                                                title={item.name}
                                                image={item.media_gallery[0].url}
                                                price={discount > 0 ? item.price_range.maximum_price.final_price.value.toString() + " " + item.price_range.maximum_price.final_price.currency : ''}
                                                offer={discount > 0 ? discountPercentage.toString() + '%' : ''}
                                                discount={item.price_range.maximum_price.regular_price.value.toString() + " " + item.price_range.maximum_price.final_price.currency}
     
                                                onPress={() => {

                                                    navigation.pop();
                                                    navigation.push('ProductsDetails', { product: item });

                                                }}
                                                onPress3={() => addItemToWishList(item)}

                                            />
                                    </View>
                                )
                            })}
                        </View>
                    </ScrollView>
                </View>
               
                
                
            </ScrollView>
        </View>
    )
}

export default Notification