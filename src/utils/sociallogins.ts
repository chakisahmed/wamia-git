import {AccessToken, LoginManager, Profile} from 'react-native-fbsdk-next';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin'
import axiosInstance from '../api/axiosConfig';
import axios from 'axios';
import { IOS_CLIENT_ID,API_CLIENT_ID,API_CLIENT_SECRET } from '@env';
import { Platform } from 'react-native';
GoogleSignin.configure({
  webClientId: API_CLIENT_ID,
  iosClientId: IOS_CLIENT_ID,
  offlineAccess: true,
})  
// import { appleAuth } from '@invertase/react-native-apple-authentication';
export const facebookLogin = async () => {
  try {
    // Attempt a login using the Facebook login dialog asking for default permissions.
    const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);

    if (result.isCancelled) {
    } else {
      // Get the access token
      const data = await AccessToken.getCurrentAccessToken();
      if (!data) {
        return;
      }

      // Optionally, fetch user profile information
      const currentProfile = await Profile.getCurrentProfile();
      const response = await axiosInstance.post('rest/V1/integration/customer/social-login/token', {
        provider: 'facebook',
        token: data.accessToken.toString()
      })
      return response.data;
    }
  } catch (error: any) {
    console.error('Login fail with error: ' + JSON.stringify(error.response.data));
  }
  return '';

}
export   const googleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const tokenResponse = await axios.post('https://www.googleapis.com/oauth2/v3/token',{
        code: userInfo.data?.serverAuthCode,
        client_id: API_CLIENT_ID,
        client_secret: API_CLIENT_SECRET,
        grant_type: 'authorization_code', 
      })
      const response = await axiosInstance.post('rest/V1/integration/customer/social-login/token', {
        provider: 'google',
        token: tokenResponse?.data.access_token
      })
      return response.data;
      
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      } else {
      }
    }
  return '';
  }
  // export const appleLogin = async () => {
  //   Apple Sign-In is only available on iOS
  //   if (Platform.OS !== 'ios') {
  //     return;
  //   }

  //   try {
      
  //     Perform the apple sign in request
  //     const appleAuthRequestResponse = await appleAuth.performRequest({
  //       requestedOperation: appleAuth.Operation.LOGIN,
  //       requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
  //     });
      
  //     Get the identity token
  //     const { identityToken } = appleAuthRequestResponse;
      
  //     if (!identityToken) {
  //       return;
  //     }
      
      
  //     Send the token to your backend
  //     const response = await axiosInstance.post('rest/V1/integration/customer/social-login/token', {
  //       provider: 'apple',
  //       token: identityToken
  //     });
      
  //     return response.data;
  //   } catch (error: any) {
  //     console.error('Apple login failed with error: ' + JSON.stringify(error?.response?.data || error));
  //   }
  // };