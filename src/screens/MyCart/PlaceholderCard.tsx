// PlaceholderCard.tsx
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const PlaceholderCard = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#aaa" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#eee',
    borderRadius: 8,
    marginBottom: 10,
    // You can add additional styles to mimic the dimensions of your actual card
  },
});

export default PlaceholderCard;
