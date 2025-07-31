// /**
//  * ClictoPay API client for payment processing
//  */

// // Types for the payment registration request
// interface PaymentRegistrationParams {
//     amount: number;
//     language: string;
//     orderNumber: string | number;
//     [key: string]: any; // For any additional parameters
// }

// // Authentication credentials


// // API response types
// interface SuccessResponse {
//     orderId: string;
//     formUrl: string;
// }

// interface ErrorResponse {
//     errorCode: string;
//     errorMessage: string;
// }


// type ClictoPayResponse = SuccessResponse | ErrorResponse;
//  /**
//      * Register a payment with ClictoPay
//      * @param params Payment registration parameters
//      * @returns Promise with the API response
//      */


// export const registerPayment = async (params: PaymentRegistrationParams): Promise<ClictoPayResponse> => {
        
//     }
















import axios from 'axios';

/**
 * ClictoPay API client for payment processing
 */

// Types for the payment registration request
interface PaymentRegistrationParams {
    amount: number;
    currency: string | number;
    language: string;
    returnUrl?: string;
    orderNumber: string | number;
    pageView?: 'DESKTOP' | 'MOBILE';
    description?: string;
    jsonParams?: Record<string, any>;
    expirationDate?: string;
    [key: string]: any; // For any additional parameters
}

// Authentication credentials
export interface ClictoPayCredentials {
    userName: string;
    password: string;
}

// API response types
interface SuccessResponse {
    orderId: string;
    formUrl: string;
}

interface ErrorResponse {
    errorCode: string;
    errorMessage: string;
}

// Order status response types
interface OrderStatusResponse {
    errorCode: string;
    errorMessage: string;
    orderNumber: string;
    orderStatus: number;
    actionCode: number;
    actionCodeDescription: string;
    originalActionCode: string;
    amount: number;
    currency: string;
    date: number;
    ip: string;
    merchantOrderParams: MerchantOrderParam[];
    attributes: Attribute[];
    cardAuthInfo: CardAuthInfo;
    terminalId: string;
    paymentAmountInfo: PaymentAmountInfo;
    bankInfo: BankInfo;
    payerData: PayerData;
    chargeback: boolean;
    paymentWay: string;
}

interface MerchantOrderParam {
    name: string;
    value: string;
}

interface Attribute {
    name: string;
    value: string;
}

interface CardAuthInfo {
    expiration: string;
    cardholderName: string;
    paymentSystem: string;
    pan: string;
}

interface PaymentAmountInfo {
    paymentState: string;
    approvedAmount: number;
    depositedAmount: number;
    refundedAmount: number;
    feeAmount: number;
}

interface BankInfo {
    bankName: string;
    bankCountryCode: string;
    bankCountryName: string;
}

interface PayerData {
    email: string;
}

type ClictoPayResponse = SuccessResponse | ErrorResponse;

/**
 * ClictoPay API client
 */
export class ClictoPayApi {
    private baseUrl: string;
    private credentials: ClictoPayCredentials;

    constructor(credentials: ClictoPayCredentials, isTestMode: boolean = false) {
        this.baseUrl = isTestMode 
            ? 'https://test.clictopay.com/payment/rest'
            : 'https://ipay.clictopay.com/payment/rest';
        this.credentials = credentials;
    }

    /**
     * Register a payment with ClictoPay
     * @param params Payment registration parameters
     * @returns Promise with the API response
     */
    async registerPayment(params: PaymentRegistrationParams): Promise<ClictoPayResponse> {
        const url = new URL(`${this.baseUrl}/register.do`);
        
        // Add query parameters
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                url.searchParams.append(key, value.toString());
            }
        });
    
        // Prepare form data with credentials
        const formData = new FormData();
        formData.append('userName', this.credentials.userName);
        formData.append('password', this.credentials.password);
    
        try {
            const response = await axios.post(url.toString(), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error registering payment:', JSON.stringify(error, null, 2));
            throw error;
        }
    }
    
    async getOrderStatus(orderId: string): Promise<OrderStatusResponse> {
        const url = new URL(`${this.baseUrl}/getOrderStatusExtended.do`);
        url.searchParams.append('orderId', orderId);
    
        const formData = new FormData();
        formData.append('userName', this.credentials.userName);
        formData.append('password', this.credentials.password);
    
        try {
            const response = await axios.post(url.toString(), formData,{
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error checking order status:', JSON.stringify(error, null, 2));
            throw error;
        }
    }
}
