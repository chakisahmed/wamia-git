import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from './axiosConfig';
import * as Keychain from 'react-native-keychain';

// /c:/Users/TENPRO/Desktop/my-app/app/api/loginApi.ts


// interface LoginResponse {
//     status: string;
//     message: string;
//     token: string;
//     customer: {
//         id: string;
//         email: string;
//         first_name: string;
//         last_name: string;
//     };
//     addresses: {
//         street: string;
//         city: string;
//         region: string;
//         postcode: string;
//         country_id: string;
//         telephone: string;
//     }[];
// }

interface LoginPayload {    
    username: string;
    password: string;
}

export const login = async (payload: LoginPayload): Promise<string> => {
    try {
        const response = await axiosInstance.post<string>('rest/V1/integration/customer/token', payload);
        await Keychain.setGenericPassword('userToken', response.data);
        return response.data;
    } catch (error) {
        console.error(error.response.data) 
        throw error;
    }
};