//app\components\Card\Cardstyle2.tsx
import React, { useEffect } from 'react'
import { View, Text, Image, TouchableOpacity } from 'react-native'
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { useTheme } from '@react-navigation/native';
import LikeBtn from '../LikeBtn';
import CheckoutItems from '../CheckoutItems';
import { IMAGES } from '@/constants/Images';
import { GlobalStyleSheet } from '@/constants/StyleSheet';
import { Feather } from '@expo/vector-icons';
import { CartItem } from '@/api/cartApi';
import { getProductImage } from '@/api/productsApi';
import { OrderItem } from '@/api/orderApi';

type Props = {
    data: OrderItem;
    //color : any;
    //style ?: object;
    //rounded ?: any;
    //size ?: string;
    removelikebtn?: any;
    offer?:any,
    btntitle?:string,
    currency?:string,
    brand?:any,
    discount?:any,
    closebtn?:any,
    trackorder?:any,
    completed?:any,
    EditReview?:any,
    removebottom?:any,
    onPress ?: (e : any) => void,
    onPress2 ?: (e : any) => void,
    onPress3 ?: (e : any) => void,
    onPress4 ?: (e : any) => void,
    //hascolor:any
}
    
const Cardstyle3 = ({data,removelikebtn,offer,currency,btntitle,onPress,discount,closebtn,trackorder,completed,EditReview,onPress2,removebottom,onPress3,onPress4: handleRemoveItem}:Props) => {

    const theme = useTheme();
    const { colors } : {colors : any} = theme;
    const [image, setImage] = React.useState<string>('');

    useEffect(() => {
        const loadImage = async () => {
            const response = await getProductImage(data.sku.split('-')[0]);

            setImage(response??'');
        };
        loadImage();
    }, []);

  return (
    <View 
        style={{
            marginTop: 0,
            paddingHorizontal: 15,
            paddingVertical:10,
            paddingBottom:0,
            backgroundColor:theme.dark ? 'rgba(255,255,255,.1)':colors.card,
        }}
    >
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.5}
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 0,
                justifyContent:'center',
                borderBottomWidth:removebottom ? 0:1,
                borderBottomColor:COLORS.primaryLight,
                paddingBottom:10,
                marginHorizontal:-15
            }}
        >
            <View style={{height: undefined, width:SIZES.width / 2.8,aspectRatio:1/1, borderRadius: 8}}> 
                {image != '' && (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Image
                            style={{ height: undefined, width: SIZES.width / 3.5, aspectRatio: 1 / 1, resizeMode: 'contain' }}
                            source={{ uri: image }}
                        />
                    </View>
                )}
            </View>
            <View style={{flex:1}}>
                <Text  style={[FONTS.fontMedium,{fontSize:12,color:COLORS.primary,paddingRight:30}]}>Item</Text>
                <Text numberOfLines={1} style={[FONTS.fontMedium,{fontSize:13,color:colors.title,marginTop:5,paddingRight:10}]}>{data.name}</Text>
                <View style={{flexDirection:'row',alignItems:'center',marginTop:2,gap:5}}>  
                    <Text style={[FONTS.fontMedium,{fontSize:14,color:colors.title}]}>{data.price*data.qty_ordered} {currency??''}</Text>

                </View>
            </View>
            {closebtn ?
                <TouchableOpacity
                    onPress={handleRemoveItem}
                    style={{position:'absolute',right:10,top:5}}
                >
                    <Feather size={20} color={colors.title} name={'x'} />
                </TouchableOpacity>
            :
            null
            }
        </TouchableOpacity>
        {removebottom ?
            null 
            :
            <View style={{height:40,width:'100%',justifyContent:'space-between',flexDirection:'row',alignItems:'center'}}>
                {trackorder ? 
                    <View  style={{flexDirection:'row',alignItems:'center',gap:5,paddingHorizontal:0}}>
                        <Feather size={14} color={colors.primary} name={'truck'} />
                        <Text style={[FONTS.fontRegular,{fontSize:14,color:colors.text}]}>Track Order</Text>
                    </View>
                :completed ? 
                    <View style={{flexDirection:'row',alignItems:'center',gap:5,paddingHorizontal:0}}>
                        <Image
                            style={{ height: 16, width: 16, resizeMode: 'contain', }}
                            source={IMAGES.check4}
                        />
                        <Text style={[FONTS.fontRegular,{fontSize:14,color:COLORS.success}]}>Completed</Text>
                    </View>
                :
                    <View>
                        <CheckoutItems 
                        itemId={data.item_id}
                        qty={data.qty}
                        />
                    </View>
                }
                <View style={{width:1,height:40,backgroundColor:COLORS.primaryLight,}}/>
                {trackorder ?
                    <View style={{flexDirection:'row',alignItems:'center',gap:5,paddingHorizontal:0}}>
                        <Image
                            style={{ height: 16, width: 16, resizeMode: 'contain', tintColor:colors.text }}
                            source={IMAGES.Star4}
                        />
                        <Text style={[FONTS.fontRegular,{fontSize:14,color:colors.text}]}>Write Review</Text>
                    </View>
                :EditReview ?
                    <View style={{flexDirection:'row',alignItems:'center',gap:5,paddingHorizontal:0}}>
                        <Image
                            style={{ height: 16, width: 16, resizeMode: 'contain', tintColor:'#FFAC5F' }}
                            source={IMAGES.Star4}
                        />
                        <Text style={[FONTS.fontRegular,{fontSize:14,color:colors.title}]}>4.5 <Text style={{color:COLORS.primary,textDecorationLine:'underline'}}>Edit Review</Text></Text>
                    </View>
                :completed ?
                    <TouchableOpacity activeOpacity={0.5} style={{flexDirection:'row',alignItems:'center',gap:5,paddingHorizontal:0}}>
                        <Image
                            style={{ height: 16, width: 16, resizeMode: 'contain', tintColor:'#FFAC5F' }}
                            source={IMAGES.Star4}
                        />
                        <Text style={[FONTS.fontRegular,{fontSize:14,color:colors.title}]}>Write Review</Text>
                    </TouchableOpacity>
                :
                    <TouchableOpacity
                        onPress={handleRemoveItem} 
                        activeOpacity={0.5} 
                        style={{flexDirection:'row',alignItems:'center',gap:5,paddingHorizontal:0}}
                    >
                        <Feather size={14} color={colors.text} name={'save'} />
                        <Text style={[FONTS.fontRegular,{fontSize:14,color:colors.text}]}>Save for later</Text>
                    </TouchableOpacity>
                }      
                <View style={{width:1,height:40,backgroundColor:COLORS.primaryLight,}}/>
                <TouchableOpacity
                    onPress={handleRemoveItem} 
                    activeOpacity={0.5} 
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 5, }}
                >
                    <Image
                        style={{ height: 16, width: 16, resizeMode: 'contain', tintColor:COLORS.danger }}
                        source={IMAGES.delete}
                    />
                    <Text style={{ ...FONTS.fontMedium, fontSize: 14, color:COLORS.danger }}>Remove</Text>
                </TouchableOpacity>
            </View>
        }
    </View>
  )
}

export default Cardstyle3