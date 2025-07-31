// CardBasedOrderSelection.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated
} from 'react-native';
import { Checkbox } from 'react-native-paper';
import { COLORS } from '@/constants/theme';
import { OrderItem } from '@/api/orderApi';
import { CustomerOrdersRMA } from '@/api/rmaApi';
import { t } from 'i18next';

interface CardBasedOrderSelectionProps{

    orders: CustomerOrdersRMA[];
    selectedOrder: string;
    onSelectOrder: (id: string) => void

}

const CardBasedOrderSelection = ({ orders, selectedOrder, onSelectOrder } : CardBasedOrderSelectionProps) => {
  return (
    <View style={styles.cardContainer}>
      {orders?.map((order) => (
        <TouchableOpacity
          key={order.id}
          style={[
            styles.orderCard,
            selectedOrder === order.id && styles.orderCardSelected
          ]}
          onPress={() => onSelectOrder(order.id)}
          activeOpacity={0.7}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardLeft}>
              <View style={styles.checkboxContainer}>
                <View style={[
                  styles.customCheckbox,
                  selectedOrder === order.id.toString() && styles.customCheckboxSelected
                ]}>
                  {selectedOrder === order.id.toString() && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
              </View>
              <View style={styles.orderInfo}>
                <Text style={styles.orderTitle}>{t("order")}: {order.info}</Text>

                {/* {order.total && (
                  <Text style={styles.orderTotal}>{order.total}</Text>
                )} */}
              </View>
            </View>
            <View style={styles.cardRight}>
              <Text style={styles.orderIcon}>📦</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default CardBasedOrderSelection;

const styles = StyleSheet.create({
  // Card-based Order Selection Styles
  cardContainer: {
    gap: 12,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderCardSelected: {
    borderColor: COLORS.secondary || '#007AFF',
    backgroundColor: '#f8faff',
    shadowOpacity: 0.15,
    elevation: 5,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  customCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customCheckboxSelected: {
    borderColor: COLORS.secondary || '#007AFF',
    backgroundColor: COLORS.secondary || '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderInfo: {
    flex: 1,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  orderSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary || '#007AFF',
  },
  cardRight: {
    marginLeft: 12,
  },
  orderIcon: {
    fontSize: 24,
  },
})