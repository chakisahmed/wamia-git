// src/api/homeService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fecthHomepageData,
  HomepageData, // Use the fully-typed interface
  Tags,
  FeaturedProduct,
  FeaturedCategory,
  BannerImage,
} from './homepageDataApi';
import { Product } from './productsApi';

/**
 * Interface for a processed layout block from the homepage.
 */
interface BaseLayoutData {
  layout_id: string;
  name: string;
  dataSource: string;
}
export interface ProductLayout extends BaseLayoutData {
  type: 'product';
  data: Product[];
  layoutAppearance: string;
  dateRange: [string, string];
}

interface CategoryLayout extends BaseLayoutData {
  type: 'category';
  data: FeaturedCategory[];
}

interface BannerLayout extends BaseLayoutData {
  type: 'banner';
  data: BannerImage[];
}

interface ImageLayout extends BaseLayoutData {
  type: 'image';
  data: BannerImage[]; // Assuming 'image' type also uses banner-like data
}
export type SortedLayoutItem = ProductLayout | CategoryLayout | BannerLayout | ImageLayout;

/**
 * Interface for the raw homepage API response.
 */
export interface HomepageResponse {
  bannerImages: any[];
  featuredCategories: any[];
  featuredCategories4x1: any[];
  featuredCategories4x2: any[];
  bannerImage2x2: any[];
  carousel: any[];
  tags: Tags[];
  sort_order: Array<{
    layout_id: string;
    type: string;
  }>;
  // Include any additional fields from your API response if needed.
}

/**
 * Fetches the homepage data and processes the layout information.
 */
export const fetchHomeData = async (): Promise<{
  sortedLayoutData: SortedLayoutItem[];
  tags: Tags[];
}> => {
  try {
    // Use the fully-typed HomepageData interface directly
    const data: HomepageData = await fecthHomepageData();
    const {
      bannerImages,
      featuredCategories,
      bannerImage2x2,
      carousel,
      tags,
      sort_order,
    } = data;

    // Process the sort_order array to create a list of layout data blocks.
    const sortedLayoutData: SortedLayoutItem[] = sort_order.map((order) => {
      const layoutId = order.layout_id;
      
      // Use switch for cleaner logic based on the discriminant 'type'
      switch (order.type) {
        case 'product': {
          const productElement = carousel.find(
            (item) => 'product-' + item.id === layoutId && item.type === 'product'
          );
          if (productElement) {
            return {
              layout_id: layoutId,
              name: productElement.label,
              dataSource: 'product',
              type: 'product',
              data: productElement.products,
              layoutAppearance: productElement.layout_appearance,
              // Add a check for start_date/end_date if they can be null/undefined
              dateRange: [productElement.start_date || '', productElement.end_date || ''],
            };
          }
          // Fallback or error case
          return null;
        }

        case 'category': {

          
          
          // Fallback to main featured categories
          return {
            layout_id: layoutId,
            name: layoutId == "maincategories" ? "Main Categories":'Featured Categories',
            dataSource: layoutId == "maincategories" ? "mainCategories" :'featuredCategories',
            type: 'category',
            data: featuredCategories,
          };
        }
        
        case 'banner': {
          const imageElement2x2 = bannerImage2x2?.find((item) => item.layout_id === layoutId);
          if (imageElement2x2) {
            const banners: BannerImage[] = [];
            for (let i = 1; i <= 4; i++) {
              const banner = imageElement2x2.banners[0]?.[`bannerImage${i}`];
              if (banner) banners.push(banner);
            }
            return {
              layout_id: layoutId,
              name: imageElement2x2.label,
              dataSource: 'bannerImage2x2',
              type: 'banner',
              data: banners,
            };
          }
          // Fallback to main banner images
          return {
            layout_id: layoutId,
            name: 'Banners',
            dataSource: 'bannerImage',
            type: 'banner',
            data: bannerImages,
          };
        }

        case 'image': {
          const imageElement = carousel.find(
            (item) => item.id === layoutId && item.type === 'image'
          );
          if (imageElement) {
             return {
              layout_id: layoutId,
              name: imageElement.label,
              dataSource: 'carousel.image',
              type: 'image',
              // Assuming imageElement has a 'banners' property matching BannerImage[]
              // If not, you may need to adjust the source interface 'Carousel'
              data: imageElement.banners || [],
            };
          }
          return null;
        }

        default:
          return null;
      }
    }).filter((item): item is SortedLayoutItem => item !== null); // Filter out any nulls and assert the type

    return { sortedLayoutData, tags };
  } catch (error) {
    console.error('Error in fetchHomeData:', error);
    throw error;
  }
};


/**
 * Fetches best seller products.
 */
export const fetchBestSellerProducts = async (): Promise<Product[]> => {
  try {
    const { products, totalCount, loading, error } = useProducts({
    searchTerm: "",
    page: 1,
    categoryId: "2957",
    sortBy: { name: 'ASC' }
  });

    //await getProducts('', 1, 2957, '', 20, '');
    return products ?? [];
  } catch (error) {
    console.error('Error fetching best seller products:', error);
    return [];
  }
};

/**
 * Fetches the newest products.
 */
export const fetchNewestProducts = async (page: number | undefined): Promise<any[]> => {
  try {
    const response = await getProducts('', page ?? 1, null, '', 50, '');
    return response.items;
  } catch (error) {
    console.error('Error fetching newest products:', error);
    return [];
  }
};

/**
 * Fetches recently viewed products from AsyncStorage.
 */
export const fetchRecentlyViewedProducts = async (): Promise<any[]> => {
  try {
    const recentlyViewed = await AsyncStorage.getItem('recentlyViewed');
    if (recentlyViewed) {
      const skus = recentlyViewed.split(',');
      const response = await getProducts('', 1, null, `sku:{in:["${skus.join('","')}"]}`, 20, '');
      return response.items;
    }
    return [];
  } catch (error) {
    console.error('Error fetching recently viewed products:', error);
    return [];
  }
};
