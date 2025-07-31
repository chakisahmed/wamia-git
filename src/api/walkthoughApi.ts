// src/api/fetchWalkthroughs.ts

import axiosInstance from './axiosConfig';
import { WalkthroughResponse, WalkthroughType } from '../types/walkthroughTypes';

export const fetchWalkthroughs = async (): Promise<WalkthroughType[]> => {
  try {
    const response = await axiosInstance.get<WalkthroughType[]>('/rest/V1/customermobile/walkthrough');
    return response.data as WalkthroughType[];   
  //   return [
  //     {
  //         "id": "1",
  //         "title": "",
  //         "description": "",
  //         "image": "https://i.imgur.com/YE3KcxO.png",
  //         "sort_order": "1"
  //     },
  //     {
  //         "id": "2",
  //         "title": "", 
  //         "description": "",
  //         "image": "https://i.imgur.com/VAfEvWD.png",
  //         "sort_order": "2"
  //     },
  //     {
  //         "id": "3",
  //         "title": "",
  //         "description": "",
  //         "image": "https://i.imgur.com/EgmuDj2.png",
  //         "sort_order": "3"
  //     }
  //     ,{
  //         "id": "5",
  //         "title": "",
  //         "description": "",
  //         "image": "https://i.imgur.com/rN5Gd48.png",
  //         "sort_order": "5"
  //     }
  //     ,{
  //         "id": "6",
  //         "title": "",
  //         "description": "",
  //         "image": "https://i.imgur.com/ZfJrqiQ.png",
  //         "sort_order": "6"
  //     },
  //     {
  //       "id": "7",
  //       "title": "",
  //       "description": "",
  //       "image": "https://i.imgur.com/mZwrSRO.png",
  //       "sort_order": "7"
  //   },
  //   {
  //       "id": "8",
  //       "title": "",
  //       "description": "",
  //       "image": "https://i.imgur.com/N4djd2y.png",
  //       "sort_order": "8"
  //   },
  //   {
  //       "id": "9",
  //       "title": "",
  //       "description": "",
  //       "image": "https://i.imgur.com/Kmdy1sR.png",
  //       "sort_order": "9"
  //   }
  // ] as WalkthroughType[];
  //   return [
  //     {
  //         "id": "1",
  //         "title": "Hello!",
  //         "description": "Discover the best deals and latest trends in fashion, electronics, and more.",
  //         "image": "https://i.imgur.com/npREZBb.png",
  //         "sort_order": "1"
  //     },
  //     {
  //         "id": "2",
  //         "title": "Shop With Ease Online", 
  //         "description": "Explore a wide range of categories to find exactly what you're looking for.",
  //         "image": "https://i.imgur.com/Hi4uwS5.png",
  //         "sort_order": "2"
  //     },
  //     {
  //         "id": "3",
  //         "title": "Pay Online Securely",
  //         "description": "Enjoy a seamless and secure checkout experience with multiple payment options.",
  //         "image": "https://i.imgur.com/YO7u6jH.png",
  //         "sort_order": "3"
  //     }
  //     ,{
  //         "id": "4",
  //         "title": "Enjoy Home Delivery",
  //         "description": "Get your orders delivered straight to your doorstep, wherever you are.",
  //         "image": "https://i.imgur.com/5bSn28D.png",
  //         "sort_order": "4"
  //     }
  //     ,{
  //         "id": "5",
  //         "title": "30-Day Change Guaranteed",
  //         "description": "Not satisfied with your order? Return it within 30 days for a full refund.",
  //         "image": "https://i.imgur.com/ho291aV.png",
  //         "sort_order": "4"
  //     }
  // ] as WalkthroughType[];
  } catch (error) {
    throw error;
  }
};