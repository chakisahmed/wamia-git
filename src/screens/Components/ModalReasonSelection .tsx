

import { ReasonRMA } from '@/api/rmaApi';
import { COLORS } from '@/constants/theme';
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TextInput,
  FlatList,
  Dimensions
} from 'react-native';

const { height: screenHeight } = Dimensions.get('window');

interface ModalReasonSelectionProps {
    reasons: ReasonRMA[]
    selectedReason: string
    onSelectReason: (id:string)=> void
    placeholder: string
    modalTitle: string

}

const ModalReasonSelection = ({ 
  reasons, 
  selectedReason, 
  onSelectReason, 
  placeholder = "Select Reason",
  modalTitle = "Select Reason"
} : ModalReasonSelectionProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredReasons = reasons?.filter(reason =>
    reason.reason.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleSelectReason = (reasonId:string) => {
    onSelectReason(reasonId);
    setModalVisible(false);
    setSearchTerm('');
  };

  const selectedReasonName = selectedReason 
    ? reasons?.find(r => r.id.toString() === selectedReason.toString())?.reason 
    : null;

  return (
    <>
      <TouchableOpacity
        style={[
          styles.reasonButton,
          selectedReason && styles.reasonButtonSelected
        ]}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.reasonButtonContent}>
          <Text style={styles.reasonIcon}>❓</Text>
          <Text style={[
            styles.reasonButtonText,
            selectedReason && styles.reasonButtonTextSelected
          ]}>
            {selectedReasonName || placeholder}
          </Text>
        </View>
        <Text style={styles.reasonChevron}>▼</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{modalTitle}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={styles.searchContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search reasons..."
                value={searchTerm}
                onChangeText={setSearchTerm}
                autoCapitalize="none"
              />
            </View>

            {/* Reasons List */}
            <FlatList
              data={filteredReasons}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={[
                    styles.reasonItem,
                    selectedReason === item.id.toString() && styles.reasonItemSelected,
                    index === filteredReasons.length - 1 && styles.reasonItemLast
                  ]}
                  onPress={() => handleSelectReason(item.id)}
                >
                  <View style={styles.reasonItemContent}>
                    <Text style={styles.reasonItemIcon}>
                      {item.icon || '⚠️'}
                    </Text>
                    <Text style={[
                      styles.reasonItemText,
                      selectedReason === item.id.toString() && styles.reasonItemTextSelected
                    ]}>
                      {item.reason}
                    </Text>
                    {selectedReason === item.id.toString() && (
                      <Text style={styles.reasonSelectedIcon}>✓</Text>
                    )}
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No reasons found</Text>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};
export default ModalReasonSelection;

  const styles= StyleSheet.create({reasonButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reasonButtonSelected: {
    borderColor: COLORS.secondary || '#007AFF',
    backgroundColor: '#f8faff',
  },
  reasonButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reasonIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  reasonButtonText: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  reasonButtonTextSelected: {
    color: '#333',
    fontWeight: '500',
  },
  reasonChevron: {
    fontSize: 12,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: screenHeight * 0.7,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: '#f5f5f5',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    margin: 20,
    paddingHorizontal: 16,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  reasonItem: {
    padding: 16,
    marginHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  reasonItemSelected: {
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    borderBottomWidth: 0,
    marginBottom: 8,
  },
  reasonItemLast: {
    borderBottomWidth: 0,
  },
  reasonItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reasonItemIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  reasonItemText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  reasonItemTextSelected: {
    fontWeight: '500',
  },
  reasonSelectedIcon: {
    fontSize: 16,
    color: COLORS.secondary || '#007AFF',
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});