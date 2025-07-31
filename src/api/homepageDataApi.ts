import axiosInstance from "./axiosConfig";
export interface BannerImage {
    id: string;
    name: string;
    banner_type: string;
    catalog_id: string;
    url: string;
}

export interface FeaturedCategory {
    id: string;
    categoryName: string;
    categoryId: string;
    url: string;
}

export interface FeaturedProduct {
    entity_id: string;
    sku: string;
    price: string;
    image: string | null;
    name: string;
    final_price_float: string | null;
    final_price: string;
    price_float: string | null;
}

interface Carousel {
    id: string;
    type: string;
    label: string;
    product_ids: string;
    layout_appearance: string;
    products: FeaturedProduct[];
}

interface SortOrder {
    id: string;
    layout_id: string;
    label: string;
    position: string;
    type: string;
}

export interface Tags {
    id: string;
    name: string;
    image: string | null;
    category_id: string;
}

export interface HomepageData {
    status: string;
    message: string;
    bannerImages: BannerImage[];
    featuredCategories: FeaturedCategory[];
    carousel: Carousel[];
    // UPDATE: Use the new, specific interfaces
    featuredCategories4x1: FeaturedCategoriesLayout[];
    featuredCategories4x2: FeaturedCategoriesLayout[];
    bannerImage2x2: BannerGridLayout[]; // Assuming this field exists based on homeService.ts logic
    sort_order: SortOrder[];
    tags: Tags[];
}   

export interface FeaturedCategoriesLayout {
  id: string;
  layout_id: string;
  label: string;
  // This is a complex nested object, we can type it precisely
  featuredCategories: {
    [key: string]: {
      id: string;
      categoryName: string;
      categoryId: string;
      url: string;
    }
  }[];
}

// NEW: Interface for the 2x2 banner grid block
export interface BannerGridLayout {
    id: string;
    layout_id: string;
    label: string;
    // Similar complex nested object
    banners: {
        [key: string]: {
            id: string;
            name: string;
            banner_type: string;
            catalog_id: string;
            url: string;
        }
    }[];
}



export const fecthHomepageData = async (): Promise<HomepageData> => {
    try {
        const response = await axiosInstance.get('/rest/V1/customermobile/homepage');
        return response.data as HomepageData;
    } catch (error) {
        console.error('Error fetching homepage data:', error);
        throw error;
    }
};