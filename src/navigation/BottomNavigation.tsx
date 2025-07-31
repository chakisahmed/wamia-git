import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomTabParamList } from './BottomTabParamList';
import WishlistScreen from '../screens/Wishlist/Wishlist';
import MyCartScreen from '../screens/MyCart/MyCart';
import HomeScreen from '../screens/Home/Home';
import CategoryScreen from '../screens/Category/Category';
import ProfileScreen from '../screens/Profile/Profile';
import BottomMenu from '../layout/BottomMenu';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

const Tab = createBottomTabNavigator<BottomTabParamList>();

const BottomNavigation = () => {
    const {details:fullDetails} = useSelector((state:RootState)=>state.cart)
    return (
        <Tab.Navigator
            initialRouteName='Home'
            screenOptions={{
                headerShown : false
            }}
            tabBar={(props:any) => <BottomMenu {...props} cartItemCount={fullDetails?.items_qty} />}
        >
            <Tab.Screen 
                name='Home'
                component={HomeScreen}
            />
            <Tab.Screen 
                name='Category'
                component={CategoryScreen}
            />
            <Tab.Screen 
                name='MyCart'
                component={MyCartScreen}
            />
            <Tab.Screen 
                name='Wishlist'
                component={WishlistScreen}

            />
            <Tab.Screen 
                name='Profile'
                component={ProfileScreen}
            />
        </Tab.Navigator>
    )
}

export default BottomNavigation;