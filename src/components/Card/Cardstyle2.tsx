//app\components\Card\Cardstyle2.tsx
import React, { memo,useEffect } from 'react'
import { View, Text, Image, TouchableOpacity } from 'react-native'
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { useTheme } from '@react-navigation/native';
import LikeBtn from '../LikeBtn';
import CheckoutItems from '../CheckoutItems';
import { IMAGES } from '@/constants/Images';
import { GlobalStyleSheet } from '@/constants/StyleSheet';
import { Feather } from '@expo/vector-icons';
import { CartItem } from '@/api/cartApi';
import { getProductImage, Product } from '@/api/productsApi';
import { t } from 'i18next';

type Props = {
    data: Product|CartItem|any;
    title: string;
    image:string|null;
    price: string;
    isOrderPage?: boolean;
    //color : any;
    //style ?: object;
    //rounded ?: any;
    //size ?: string;
    removelikebtn?: any;
    date?: string;
    status?: string;
    offer?:any,
    qty?:number,
    btntitle?:string,
    brand?:any,
    discount?:any,
    closebtn?:any,
    pending?:any,
    trackorder?:any,
    completed?:any,
    payment_completed?:any,
    product_view:boolean;
    EditReview?:any,
    includeImage?:boolean,
    removebottom?:any,
    onPress ?: (e : any) => void,
    onPress2 ?: (e : any) => void,
    onPress3 ?: (e : any) => void,
    onPress4 ?: (e : any) => void,
    //hascolor:any
}
    
const Cardstyle2 = memo(({data,title,price,removelikebtn,qty,payment_complete,isOrderPage,image,pending,offer,includeImage=true,btntitle,date,onPress,discount,status,product_view,closebtn,trackorder,completed,EditReview,onPress2,removebottom,onPress3,onPress4: handleRemoveItem}:Props) => {

    const theme = useTheme();
    const { colors } : {colors : any} = theme;
    const [imageUrl, setImageUrl] = React.useState<string>('');
  
    // useEffect(() => {
    //     const loadImage = async () => {
    //         const response = await getProductImage(data.sku);
    //         setImageUrl(response??'');

    //     };   
    //     if(image==null || image=='' && includeImage)
    //     loadImage();
    // }, []);

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
            {(image != '' && image!=null)||imageUrl!=''  ? (
            <View style={{height: undefined, width:SIZES.width / 2.8,aspectRatio:1/1, borderRadius: 8}}> 
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Image
                            style={{ height: undefined, width: SIZES.width / 3.5, aspectRatio: 1 / 1, resizeMode: 'contain' }}
                            source={imageUrl!=''? { uri: imageUrl} : image?.startsWith('http') ? { uri: image } : image}
                        />
                    </View>   
            </View>
                ) : <View style={{width:40}}/>}
            <View style={{flex:1}}>
                {isOrderPage && <Text  style={[FONTS.fontMedium,{fontSize:12,color:COLORS.primary,paddingRight:30}]}>{status!=null? title:'Item'}</Text>}
                <View style={{flexDirection:'row',alignItems:'center',marginTop:2,gap:5}}>
                    <Text style={[FONTS.fontMedium,{fontSize:14,color:colors.title}]}>{title ?? data.name}</Text>

                </View>
                <View style={{flexDirection:'row',alignItems:'center',marginTop:2,gap:5}}>
                    <Text style={[FONTS.fontMedium,{fontSize:14,color:colors.title}]}>{price ?? data.price +" DT"}</Text>
                    {discount!= undefined && discount!='' && <Text style={[FONTS.fontJostLight,{fontSize:12,color:colors.title,textDecorationLine:'line-through',opacity:.6}]}>{discount+ "DT"}</Text>}
                    <Text style={[FONTS.fontRegular,{fontSize:12,color:COLORS.danger,}]}>{offer}</Text>
                </View>
                <View style={{flexDirection:'row',alignItems:'center',gap:10,marginTop:2}}>

                         
                    {[...Array(5)].map((_, index) => (
                        <Image
                            key={index}
                            style={{ height: 12, width: 12 }}
                            source={index < Math.round(data.rating_summary) ? IMAGES.star5 : IMAGES.star6}
                        />
                    ))}
                    <Text style={[FONTS.fontRegular,{fontSize:12,color:colors.title,opacity:.5}]}>({data.review_count>0? data.review_count+" reviews" : t('no_reviews')})</Text>
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
                {status == 'canceled' ?
                    <View style={{flexDirection:'row',alignItems:'center',gap:5,paddingHorizontal:0}}>
                        <Feather size={14} color={COLORS.danger} name={'x'} />
                        <Text style={[FONTS.fontRegular,{fontSize:14,color:COLORS.danger}]}>{t('cancelled')}</Text>
                    </View>
                :status == 'closed' ?   
                    <View style={{flexDirection:'row',alignItems:'center',gap:5,paddingHorizontal:0}}>
                        <Image style={{ height: 16, width: 16, resizeMode: 'contain', }} source={IMAGES.lock} />
                        <Text style={[FONTS.fontRegular,{fontSize:14,color:COLORS.primary}]}>{t('closed')}</Text>
                    </View>
                
                :pending ? 
                    <TouchableOpacity activeOpacity={0.5} style={{flexDirection:'row',alignItems:'center',gap:5,paddingHorizontal:0}}>
                        <Feather size={14} color={colors.primary} name={'clock'} />
                        <Text style={[FONTS.fontRegular,{fontSize:14,color:colors.text}]}>{t(status)}</Text>
                    </TouchableOpacity>
                :trackorder ? 
                    <TouchableOpacity activeOpacity={0.5} style={{flexDirection:'row',alignItems:'center',gap:5,paddingHorizontal:0}}>
                        <Feather size={14} color={colors.primary} name={'truck'} />
                        <Text style={[FONTS.fontRegular,{fontSize:14,color:colors.text}]}>Track Order</Text>
                    </TouchableOpacity>
                :completed ? 
                    <TouchableOpacity activeOpacity={0.5} style={{flexDirection:'row',alignItems:'center',gap:5,paddingHorizontal:0}}>
                        <Image
                            style={{ height: 16, width: 16, resizeMode: 'contain', }}
                            source={IMAGES.check4}
                        />
                        <Text style={[FONTS.fontRegular,{fontSize:14,color:COLORS.success}]}>{t('completed')}</Text>
                    </TouchableOpacity>
                :payment_complete ? 
                    <TouchableOpacity activeOpacity={0.5} style={{flexDirection:'row',alignItems:'center',gap:5,paddingHorizontal:0}}>
                        <Feather size={14} color={COLORS.success} name={'check'} />
                        <Text style={[FONTS.fontRegular,{fontSize:14,color:COLORS.success}]}>{t('clictopay_processed')}</Text>
                    </TouchableOpacity>
                :product_view?
                <View></View>
                :
                    <View>
                        <CheckoutItems 
                        cartItem={data}
                        />
                    </View>
                }
                <View style={{width:1,height:40,backgroundColor:COLORS.primaryLight,}}/>
                {
                    status !=null
                    &&
                    <TouchableOpacity
                        activeOpacity={0.5} 
                        style={{flexDirection:'row',alignItems:'center',gap:5,paddingHorizontal:0}}
                    >
                        <Feather size={14} color={colors.text} name={'save'} />
                        <Text style={[FONTS.fontRegular,{fontSize:14,color:colors.text}]}>{date}</Text>
                    </TouchableOpacity>

                // :
                //     <TouchableOpacity
                //         onPress={handleRemoveItem} 
                //         activeOpacity={0.5} 
                //         style={{flexDirection:'row',alignItems:'center',gap:5,paddingHorizontal:0}}
                //     >
                //         <Feather size={14} color={colors.text} name={'save'} />
                //         <Text style={[FONTS.fontRegular,{fontSize:14,color:colors.text}]}>Save for later</Text>
                //     </TouchableOpacity>
                }      
                <View style={{width:1,height:40,backgroundColor:COLORS.primaryLight,}}/>
                {
                    status==null ?
                    (<TouchableOpacity
                    onPress={handleRemoveItem} 
                    activeOpacity={0.5} 
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 5, }}
                >
                    <Image
                        style={{ height: 16, width: 16, resizeMode: 'contain', tintColor:COLORS.danger }}
                        source={IMAGES.delete}
                    />
                    <Text style={{ ...FONTS.fontMedium, fontSize: 14, color:COLORS.danger }}>{t('remove')}</Text>
                </TouchableOpacity>):
(<TouchableOpacity
    onPress={onPress} 
    activeOpacity={0.5} 
    style={{ flexDirection: 'row', alignItems: 'center', gap: 5, }}
>
    <Image
        style={{ height: 16, width: 16, resizeMode: 'contain', tintColor:COLORS.info }}
        source={IMAGES.folder}
    />
    <Text style={{ ...FONTS.fontMedium, fontSize: 14, color:COLORS.info }}>{t("details")}</Text>
</TouchableOpacity>)
                }
            </View>
        }
    </View>
  )
})

export default Cardstyle2