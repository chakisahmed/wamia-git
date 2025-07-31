import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from './axiosConfig';
import {login} from '../api/loginApi';
import * as Keychain from 'react-native-keychain';

/**payloqd:{
  "customer": {
    "email": "jdoe@example.com",
    "firstname": "Jane",
    "lastname": "Doe",
    "addresses": [
      {
        "defaultShipping": true,
        "defaultBilling": true,
        "firstname": "Jane",
        "lastname": "Doe",
        "region": {
          "regionCode": "NY",
          "region": "New York",
          "regionId": 43
        },
        "postcode": "10755",
        "street": [
          "123 Oak Ave"
        ],
        "city": "Purchase",
        "telephone": "512-555-1111",
        "countryId": "US"
      }
    ]
  },
  "password": "Password1"
}
 */
export interface SignupPayload {
    customer: {
        email: string;
        firstname: string;
        lastname: string;
        addresses: {
            defaultShipping: boolean;
            defaultBilling: boolean;
            firstname: string;
            lastname: string;
            region: {
                regionCode: string;
                region: string;
                regionId: number;
            };
            postcode: string;
            street: string[];
            city: string;
            telephone: string;
            countryId: string;
        }[];
    };
    password: string;
}

export const signup = async (payload: SignupPayload): Promise<string> => {
    try {
        const response = await axiosInstance.post<string>('rest/V1/customers', payload);
        if (response.status === 200) {
            const token=await login({ username: payload.customer.email, password: payload.password });
            return token;
        }
        //await Keychain.setGenericPassword('userToken', response.data);
        else {
            throw new Error(response.data);
        }
    } catch (error) {
        throw error;
    }
};