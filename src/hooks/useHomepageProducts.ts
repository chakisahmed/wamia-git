// src/hooks/useHomepageData.ts
import { useState, useEffect } from 'react';
import { fetchHomeData, fetchBestSellerProducts, fetchNewestProducts, fetchRecentlyViewedProducts } from '../api/homeService';
import { useDispatch } from 'react-redux';

const useHomepageData = () => {
  const [bestSellerProducts, setBestSellerProducts] = useState([]);
  const [newestProducts, setNewestProducts] = useState([]);
  const [recentlyViewedProducts, setRecentlyViewedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSortedLayoutData = async () => {
      try {

        
        
        // loadBestSellerProducts();
        // loadNewestProducts();
        // loadRecentlyViewedProducts();
      } catch (error) {
        
      }
    }
    const loadBestSellerProducts = async () => {
      const startTime = Date.now();
        const bestSellers = await fetchBestSellerProducts();
        const endTime = Date.now();
        setBestSellerProducts(bestSellers);
    }
    const loadNewestProducts = async () => {
      const startTime = Date.now();
      const newest = await fetchNewestProducts();
      const endTime = Date.now();
        setNewestProducts(newest);
        
    }
    
    const loadRecentlyViewedProducts = async () => {
      try {
        const recentlyViewed = await fetchRecentlyViewedProducts();
        setRecentlyViewedProducts(recentlyViewed);
      } catch (error) {
        console.error('Error loading home data:', error);
      } finally {
        
      }
    };

    
    loadSortedLayoutData();
    
  }, []);

  return { sortedLayoutData, bestSellerProducts, newestProducts, recentlyViewedProducts, tags, isLoading };
};

export default useHomepageData;
