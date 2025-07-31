// Return Merchandise Authorization REST APIs

import axiosInstance from "./axiosConfig";




export const getCustomerRMA = async (id: string): Promise<RMA[]> => {
    try {
        const response = await axiosInstance.get<RMA[]>(`rest/V1/rmaapi/customer/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
export const getReasonsRMA = async (): Promise<ReasonRMA[]> => {
    try {
        const response = await axiosInstance.get<ReasonRMA[]>(`rest/V1/rmaapi/reasons`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
/**
 * get simplified orders by customer id
 */
export const getCustomerOrdersRMA = async (customerId: string): Promise<CustomerOrdersRMA[]> => {
    try {
        const response = await axiosInstance.get<CustomerOrdersRMA[]>(`rest/V1/rmaapi/customer/orders/${customerId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// get order items
export const getOrderItemsRMA = async (id: string): Promise<OrderItemRMA[]> => {
    try {
        const response = await axiosInstance.get<OrderItemRMA[]>(`rest/V1/rmaapi/customer/order/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getResolutionsRMA = async (orderId: string): Promise<ResolutionsRMA[]> => {
    try {
        const response = await axiosInstance.get<ResolutionsRMA[]>(`rest/V1/rmaapi/order/resolution/${orderId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
export const cancelRma = async (rmaId: string): Promise<ResolutionsRMA[]> => {
    try {
        const response = await axiosInstance.put<ResolutionsRMA[]>(`rest/V1/rmaapi/${rmaId}`,{
            status: 4
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};
export const getRmaDetails = async (rmaId: string): Promise<RMA> => {
    try {
        const response = await axiosInstance.get<RMA[]>(`rest/V1/rmaapi/${rmaId}`);
        return response.data[0];
    } catch (error) {
        throw error;
    }
};
export const getStatusLabelsRMA = async (): Promise<RmaStatusMap> => {
    try {
        const response = await axiosInstance.get<RmaStatusMap>(`rest/V1/rmaapi/status`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
export const createRma = async (payload:CreateRmaPayload): Promise<string> => {
    try {
        const response = await axiosInstance.post<string>(`rest/V1/rmaapi`,{data:payload});
        console.log("create response : ",JSON.stringify(response.data))
        return response.data;
    } catch (error) {
        console.error(error)
        throw error;
    }
};
export interface SendMessageRMAPayload{
    message: string;
    sender_type: number;
    rma_id: number

}
export const sendMessage = async (payload:SendMessageRMAPayload): Promise<ConversationRMA> => {
    try {
        const response = await axiosInstance.post<ConversationRMA>(`rest/V1/rmaapi/message`,payload);
        return response.data;
    } catch (error) {
        console.error(error.response)
        throw error;
    }
};


export interface RMA {
    id: string;
    orderRef: string;
    orderId: string;
    rmaStatus: string;
    orderStatus: string;
    createdDate?: string;
    resolutionType?: string;
    additionalInfo?: string;
    images?: string[]; // Replace `any` with a more specific type if you know the structure of images
    conversations?: ConversationRMA[]; // Replace `any` if you have conversation structure
    product?: ProductDetailsRMA[];
    number?: string | null;

}
/**"sender" => $sender,
                        "senderType" => $senderType,
                        "message" => $conv->getMessage(),
                        'createdTime' => $conv->getCreatedTime() */
export interface ConversationRMA{
    id:number
    sender: string
    senderType: string
    message: string
    createdTime: string
}
export interface ReasonRMA {
    id: string,
    reason: string
}

export interface CustomerOrdersRMA {
    id: string;
    info: string
}
interface OrderItemRMA {
    id: string;
    name: string;
    price: string;
    qty: number;
    image: string;
    seller: {
        seller_id: string;
        seller_name: string;
    };
}

export interface ResolutionsRMA {
    id: string
    name: string
}

interface ProductDetailsRMA {
    id: string;
    name: string;
    sku: string;
    price: string;
    qty: string;
    reasonId: string;
    reason: string;
    customer?: { id?: string, email?: string }
}
interface RmaStatusMap {
  [key: `${number}`]: string;
}

/**
 * Payload sent to POST /rma (createRma)
 */
export interface CreateRmaPayload {
  /** Magento order entity ID the RMA belongs to */
  order_id: string;

  /** Order-item IDs included in the return */
  item_ids: number[];

  /**
   * Quantity to return for each order-item.
   * Key = item_id, Value = qty
   */
  total_qty: Record<string, number>;

  /**
   * Reason-code selected for each order-item.
   * Key = item_id, Value = reason_id
   */
  reason_ids: Record<string, number>;

  /**
   * Number of images attached (used for a simple server-side count/limit check)
   */
  is_checked: boolean;

  /** `true` when this is a completely virtual order (no shipping) */
  is_virtual: boolean;

  /** Base-64 encoded images (one entry per file) */
  image?: string[];

  additional_info?:string;

}
