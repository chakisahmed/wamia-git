// fetchCategories.ts
import { gql } from '@apollo/client';
import { getApolloClient } from './apolloClient';
import axiosInstance from './axiosConfig';

import { MAGE_TOKEN } from '@env';
import { consoleLog } from '../utils/helpers';

export interface CategoryType {
  id: string;
  name: string;
  level: string;
  image: string;
  magefan_og_image: string;
  children: CategoryType[];
  include_in_menu: number;
}

export interface CategoriesResponse {
  items: CategoryType[];
}

export const fetchCategories = async (id: string): Promise<any> => {
  //magento rest api: rest/V1/categories parent id 2
  const startTime = Date.now();
  const response = await axiosInstance.get(`/rest/V1/categories/list?searchCriteria[filter_groups][0][filters][0][field]=parent_id&searchCriteria[filter_groups][0][filters][0][value]=${id}&searchCriteria[filter_groups][0][filters][0][condition_type]=eq&searchCriteria[filter_groups][1][filters][0][field]=include_in_menu&searchCriteria[filter_groups][1][filters][0][value]=1&searchCriteria[filter_groups][1][filters][0][condition_type]=eq`, {
    headers: {
      'Content-Type': 'application/json',
      "Authorization": `Bearer ${MAGE_TOKEN}`
    },
  });
  const endTime = Date.now();
  consoleLog("Time taken to fetch categories", endTime - startTime, " ms");

  return response.data;
};
export const fetchCategories2 = async (id: string): Promise<any> => {
  const client = getApolloClient();
  const startTime = Date.now();
  const query = gql`
    {
      categories(filters: { parent_id: { eq: "${id}" } }) {
        items {
          id
          image
          name
          level
          magefan_og_image 
          include_in_menu
          children {
            id
            name
            level
            image
            magefan_og_image
            include_in_menu
          }
        }
      }
    }
  `;
  
  const response = await client.query({ query });
  const categories: CategoriesResponse = response.data.categories;
  
  const endTime = Date.now();

  return {
    items: categories.items
      .filter((category: CategoryType) => category.include_in_menu === 1)
      .map((category: CategoryType) => ({
        ...category,
        children: category.children.filter(
          (child: CategoryType) => child.include_in_menu === 1
        ),
      })),
  };
};
export const fetchCategories3 = async (id: string): Promise<CategoriesResponse> => {
  const query = gql`
    {
      categories(filters: { parent_id: { eq: "${id}" } }) {
        items {
          id
          include_in_menu
          image
          name
          level
          magefan_og_image 
        }
      }
    }
  `;
  const client = getApolloClient();
    const response = await client.query({
      query,
    });
    
    const categories: CategoriesResponse = response.data.categories;
    
    // Initialize children arrays
    const categoriesWithChildren = categories.items.map(category => ({
      ...category,
      children: [] as CategoryType[],
    }));       
       
    return { items: categoriesWithChildren.filter((category: CategoryType) => category.include_in_menu === 1) };
  
};
export const fetchCategory = async (id: string): Promise<any> => {
  const client = getApolloClient();
  const query = gql`
    {
      categories(filters: { ids: { eq: "${id}" } }) {
        items {
          id
          image
          name
          level
          magefan_og_image 
        }
      }
    }
  `;     
    

    const response = await client.query({
      query,
    });
    
    const categories: CategoriesResponse = response.data.categories;
    
    // Initialize children arrays
    const categoriesWithChildren = categories.items.map(category => ({
      ...category,
      children: [] as CategoryType[],
    }));       
    
    return { items: categoriesWithChildren };
  
};

export const getCagetoryImage = async (id:string) : Promise<string> =>{
  const startTime = Date.now();
  const response = await axiosInstance.get(`/rest/V1/categories/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      "Authorization": `Bearer ${MAGE_TOKEN}`
    },
  });
  const endTime = Date.now();

  /** find in "custom_attributes": [
         {
            "attribute_code": "magefan_og_image",
            "value": "/_lectrom_nager_288p.jpg"
        }, */

  return response.data.custom_attributes.find((attr: { attribute_code: string; value: string; }) => attr.attribute_code === "magefan_og_image")?.value ?? "";

}
export const getCagetoryBanner = async (id:string) : Promise<string> =>{
  const startTime = Date.now();
  const response = await axiosInstance.get(`/rest/V1/categories/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      "Authorization": `Bearer ${MAGE_TOKEN}`
    },
  });
  const endTime = Date.now();

  /** find in "custom_attributes": [
         {
            "attribute_code": "magefan_og_image",
            "value": "/_lectrom_nager_288p.jpg"
        }, */

  return response.data.custom_attributes.find((attr: { attribute_code: string; value: string; }) => attr.attribute_code === "image")?.value ?? "";

}

   
// // src/api/categoriesApi.ts

// import axiosInstance from './axiosConfig';
// export interface CategoryType {
//   entity_id: string;
//   parent_id: string;
//   level: string;
//   position: string;
//   name: string;
//   image: string;
//   magefan_og_image: string;
//   banner: string;
//   thumbnail: string;
//   children: CategoryType[];
// }

// export interface CategoriesResponse {
//   status: string;
//   categories: CategoryType[];
// }
// const query=`

// `;
// export const fetchCategories = async (): Promise<CategoriesResponse> => {
//   try {
//     const response = await axiosInstance.get<CategoriesResponse>('/api/categoriescollection');
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };
