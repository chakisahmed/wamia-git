import 'react-native-gesture-handler';
import Route from '@/navigation/Route';
import BootSplash from 'react-native-bootsplash';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Provider } from 'react-redux'
import store from '@/redux/store';
import { ApolloClient, ApolloProvider, NormalizedCacheObject } from '@apollo/client';
import { initApolloClient } from '@/api/apolloClient';
import { Text, View } from 'react-native';
// import * as SplashScreen from 'expo-splash-screen';
import { Entypo } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from 'react';
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';
import { fetchCategories, fetchCategories2, fetchCategories3 } from '@/api/categoriesApi';
import { NotificationProvider } from '@/screens/Components/NotificationProvider';

// This is the default configuration
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: true, // Reanimated runs in strict mode by default
});
// SplashScreen.preventAutoHideAsync();

// // Set the animation options. This is optional.
// SplashScreen.setOptions({
//   duration: 1000,
//   fade: true,

// });

export default function App() {
  const [loaded] = useFonts({
    JostBold: require('@/assets/fonts/Jost-Bold.ttf'),
    JostSemiBold: require('@/assets/fonts/Jost-SemiBold.ttf'),
    JostLight: require('@/assets/fonts/Jost-Light.ttf'),
    JostMedium: require('@/assets/fonts/Jost-Medium.ttf'),
    JostRegular: require('@/assets/fonts/Jost-Regular.ttf'),
    JostExtraLight: require('@/assets/fonts/Jost-ExtraLight.ttf'),
    CairoBlack: require('@/assets/fonts/Cairo-Black.ttf'),
    CairoBold: require('@/assets/fonts/Cairo-Bold.ttf'),
    CairoExtraBold: require('@/assets/fonts/Cairo-ExtraBold.ttf'),
    CairoExtraLight: require('@/assets/fonts/Cairo-ExtraLight.ttf'),
    CairoLight: require('@/assets/fonts/Cairo-Light.ttf'),
    CairoMedium: require('@/assets/fonts/Cairo-Medium.ttf'),
    CairoRegular: require('@/assets/fonts/Cairo-Regular.ttf'),
    CairoSemiBold: require('@/assets/fonts/Cairo-SemiBold.ttf'),
  });
  const [client, setClient] = useState<ApolloClient<NormalizedCacheObject> | null>(null);


  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {

        const apolloClient = await initApolloClient();
        setClient(apolloClient);
        fetchCategories3("2");
        // 5 seconds
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
        BootSplash.hide({ fade: true });
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(() => {
    if (appIsReady) {
      //SplashScreen.hide();
    }
  }, [appIsReady]);

  if (!loaded || !appIsReady || !client) {
    return (
      <View>
        <StatusBar style="auto" />
      </View>
    ); 
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <SafeAreaView
        style={{
          flex: 1,
        }}>
        <StatusBar style="dark" />
        <ApolloProvider client={client}>
          <Provider store={store}>
            <NotificationProvider>
              <Route />
            </NotificationProvider>
          </Provider>
        </ApolloProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}