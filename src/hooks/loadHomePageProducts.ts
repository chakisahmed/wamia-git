// src/hooks/useHomepageData.ts
import { useState, useEffect } from 'react';
import { fetchHomeData, fetchBestSellerProducts, fetchNewestProducts, fetchRecentlyViewedProducts } from '../api/homeService';
import { useDispatch } from 'react-redux';

export const loadHomePageProducts = async () => {
  try {

    
    const startTime = Date.now();
    const [bestSellerProducts, newestProducts, recentlyViewedProducts] = await Promise.all([
      loadBestSellerProducts(),
      loadNewestProducts(),
      loadRecentlyViewedProducts()
    ]);
    const endTime = Date.now();
    return { bestSellerProducts, newestProducts, recentlyViewedProducts };
  } catch (error) {
    
  }
}
export const loadBestSellerProducts = async () => {
  const startTime = Date.now();
    const bestSellers = await fetchBestSellerProducts();
    const endTime = Date.now();
    return bestSellers;
}
export const loadNewestProducts = async () => {
  const startTime = Date.now();
  const newest = await fetchNewestProducts(1);
  const endTime = Date.now();
    return newest;
    
}

export const loadRecentlyViewedProducts = async () => {
  try {
    const recentlyViewed = await fetchRecentlyViewedProducts();
    return recentlyViewed;
  } catch (error) {
    console.error('Error loading home data:', error);
  } finally {
    
  }
};
