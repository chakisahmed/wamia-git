import React, {useEffect, useRef, useState} from 'react';
import { 
    View, 
    Animated,
    StyleSheet,
    TouchableOpacity,
    Text,
    Image,
    Dimensions
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { GlobalStyleSheet } from '../constants/StyleSheet';
import { SIZES, FONTS, COLORS } from '../constants/theme';
import { IMAGES } from '../constants/Images';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { t } from 'i18next';

type Props = {
    state : any,
    navigation : any,
    descriptors : any,
    cartItemCount?: number; // Add this prop to your Props type
}

const BottomMenu = ({state, navigation, descriptors, cartItemCount}: Props) => {

    const theme = useTheme();
    const {colors} : {colors : any} = theme;
    
    const [tabWidth, setWidth] = useState(wp('100%'));

    const tabWD =
        tabWidth < SIZES.container ? tabWidth / 5 : SIZES.container / 5;

    const circlePosition = useRef(
        new Animated.Value(0),
    ).current;

    Dimensions.addEventListener('change', val => {
        setWidth(val.window.width);
    });
    
    useEffect(() => {
        Animated.spring(circlePosition, {
            toValue: state.index * tabWD,
            useNativeDriver: true,
        }).start();
    },[state.index,tabWidth])


    const onTabPress = (index:any) => {
        const tabW =
            tabWidth < SIZES.container ? tabWidth / 5 : SIZES.container / 5; // Adjust this according to your tab width

        Animated.spring(circlePosition, {
            toValue: index * tabW,
            useNativeDriver: true,
        }).start();
    };




    return (
        <View style={{
            backgroundColor:theme.dark ? 'rgba(0,3,3,1)' : colors.card,
        }}>
            
                <View
                    style={[styles.tabBar,
                    {
                        borderTopColor:colors.border,
                    }]}
                >
                    <View
                        style={[GlobalStyleSheet.container,{
                            flexDirection: 'row',
                            paddingHorizontal: 0,
                            paddingTop: 0,
                            paddingBottom: 0,
                        }]}
                    >

                        <Animated.View style={{transform: [{translateX: circlePosition}]}}>
                            <View
                                style={{
                                    width: tabWidth < SIZES.container ? tabWidth / 5 : SIZES.container / 5,
                                    position: 'absolute',
                                    //backgroundColor:'red',
                                    zIndex: 1,
                                    top:0,
                                    left: 0,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                {/* <View
                                    style={{
                                        height:65,
                                        width:65,
                                        borderRadius:0,
                                        backgroundColor:'rgba(255,255,255,.1)',
                                        position:'absolute',
                                    }}
                                /> */}
                                <View
                                    style={{
                                        height:4,
                                        width:54,
                                        borderRadius:4,
                                        borderTopLeftRadius:0,
                                        borderTopRightRadius:0,
                                        backgroundColor:theme.dark ? COLORS.white :COLORS.primary,
                                    }}
                                />
                            </View>
                        </Animated.View>

                        {state.routes.map((route:any , index:string) => {

                            const {options} = descriptors[route.key];
                            const label =
                            options.tabBarLabel !== undefined
                                ? options.tabBarLabel
                                : options.title !== undefined
                                ? options.title
                                : route.name;

                            const isFocused = state.index === index;

                            const iconTranslateY = useRef(new Animated.Value(0)).current;
                            Animated.timing(iconTranslateY, {
                                toValue: isFocused ? -20 : 0,
                                duration: 200,
                                useNativeDriver: true,
                            }).start();

                            const onPress = () => {
                                const event = navigation.emit({
                                  type: 'tabPress',
                                  target: route.key,
                                  canPreventDefault: true,
                                });
                
                                if (!isFocused && !event.defaultPrevented) {
                                  navigation.navigate({name: route.name, merge: true});
                                  onTabPress(index);
                                }
                            };

                            return(
                            <View
                                key={index}
                                style={styles.tabItem}
                            >
                                <TouchableOpacity
                                    onPress={onPress}
                                    style={styles.tabLink}
                                >
                                    {/* --- START SNIPPET TO ADD / MODIFY --- */}
                                    {label === 'MyCart' ? (
                                        // Specific container for MyCart to position the badge
                                        <View style={{ position: 'relative' }}>
                                            <Image
                                                style={{
                                                    height:24,
                                                    width:24,
                                                    marginBottom:2,
                                                    resizeMode:'contain',
                                                    tintColor:  theme.dark? (isFocused? "orange" : COLORS.primaryLight) : (isFocused ? COLORS.primary : colors.title)
                                                }}
                                                source={IMAGES.mycart} // Directly use IMAGES.mycart for MyCart
                                            />
                                            {/* Render badge only if cartItemCount is greater than 0 */}
                                            {cartItemCount > 0 ? (
                                                <View style={styles.badgeContainer}>
                                                    <Text style={styles.badgeText}>
                                                        {cartItemCount > 99 ? '99+' : cartItemCount}
                                                    </Text>
                                                </View>
                                            ) : null}
                                        </View>
                                    ) : (
                                        // Original image rendering logic for ALL OTHER tabs
                                        <Image
                                            style={label == 'Profile' ?
                                            {
                                                height:24,
                                                width:24,
                                                borderRadius:50,
                                                marginBottom:2,
                                                resizeMode:'contain'
                                            }
                                                :
                                            {
                                                height:24,
                                                width:24,
                                                marginBottom:2,
                                                resizeMode:'contain',
                                                tintColor:  theme.dark? (isFocused? "orange" : COLORS.primaryLight) : (isFocused ? COLORS.primary : colors.title)
                                            }}
                                            source={
                                                label === 'Home'    ?  IMAGES.Home:
                                                label === 'Category' ?  IMAGES.grid:
                                                // Removed 'MyCart' case from here as it's handled above
                                                label === 'Wishlist'   ?  IMAGES.heart2:
                                                label === 'Profile'  ?  {uri:'https://www.wamia.tn/media/catalog/product/placeholder/default/ph_base.jpg'} : IMAGES.Home
                                            }
                                        />
                                    )}
                                    {/* --- END SNIPPET TO ADD / MODIFY --- */}
                                    <Text style={[styles.navText,{color:theme.dark? (isFocused? "orange" : COLORS.primaryLight) : (isFocused ? COLORS.primary : colors.title) }]}>{t(label)}</Text>
                                </TouchableOpacity>
                            </View>
                        )
                    })}
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    tabBar : {
        height : 60,
        //borderTopWidth:1,
    },
    tabItem : {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: 60,
        paddingTop:10
    },
    tabLink : {
        alignItems: 'center',
    },
    navText : {
        ...FONTS.fontRegular,
        fontSize:13
    },
    badgeContainer: {
        position: 'absolute',
        top: -5, // Adjust vertical position as needed
        right: -5, // Adjust horizontal position as needed
        backgroundColor: COLORS.secondary,
        borderRadius: 10, // Makes it a circle
        minWidth: 15, // Ensures it's wide enough for a single digit and looks like a circle
        height: 15, // Ensures it's a circle
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 3, // Adds a little padding for numbers, allows expansion
        zIndex: 10, // Ensures the badge is on top
        // Optional: Border for better visibility on light backgrounds
        borderColor: COLORS.white,
        borderWidth: 1,
    },
    badgeText: {
        color: 'black', // Text color inside the badge
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
    }
});
 
export default BottomMenu;