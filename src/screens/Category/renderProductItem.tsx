import React from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addToWishlist, removeFromWishlist } from '@/redux/actions/wishlistActions'; // Adjust the import path as necessary

const renderProductItem = ({ item }) => {
    const calculateDiscount = (price:number, finalPrice:number) => {
        if (finalPrice < price) {
          return Math.round(((price - finalPrice) / price) * 100);
        }
        return 0; 
      };
  const discount = calculateDiscount(item.price, item.finalPrice);

  return (
    <View style={styles.productItem}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.thumbNail }} style={styles.productImage} />
        {discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discount}%</Text>
          </View>
        )}
              {/* <TouchableOpacity style={styles.wishlistButton} >
    <Text style={styles.wishlistButtonText}>{'Add to Wishlist'}</Text>
  </TouchableOpacity> */}
      </View>
      <Text style={styles.productName}>{item.name}</Text>
      {discount > 0 ? (
        <View style={styles.prices}>
          <Text style={styles.originalPrice}>{item.formattedPrice}</Text>
          <Text style={styles.finalPrice}>{item.formattedFinalPrice}</Text>
        </View>
      ) : (
        <Text style={styles.productPrice}>{item.formattedFinalPrice}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
    productContainer: {
      position: 'relative',
      margin: 10,
    },
    productImage: {
      width: '100%',
      height: 200,
    },
    wishlistButton: {
      position: 'absolute',
      top: 10,
      right: 10,
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: 10,
      borderRadius: 5,
    },
    wishlistButtonText: {
      color: 'white',
    },
    productName: {
      marginTop: 10,
      fontSize: 16,
      fontWeight: 'bold',
    },
    productPrice: {
      marginTop: 5,
      fontSize: 14,
      color: 'gray',
    },
  });
  
  export default renderProductItem;