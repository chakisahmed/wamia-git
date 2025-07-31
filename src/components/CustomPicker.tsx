// CustomPicker.js
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Keyboard,
  Dimensions,
  Platform,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Or your preferred icon library
import { IMAGES } from '../constants/Images';
import { COLORS } from '../constants/theme';
import { useTheme } from '@react-navigation/native';

const SCREEN_HEIGHT = Dimensions.get('window').height;



const CustomPicker = ({
  options = [],
  onValueChange, // This will now receive the whole item object
  selectedValue,
  placeholder = 'Select an item...',
  searchPlaceholder = 'Search...',
  noResultsText = 'No results found',
  leadingIcon = IMAGES.region, // Default leading icon
  borderColor = '#ccc', // Default border color
}) => {
   const theme = useTheme();

  const [modalVisible, setModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Find the label for the currently selected value
  const selectedLabel = useMemo(() => {
    if (selectedValue === null || selectedValue === undefined) {
      return '';
    }
    const selectedOption = options.find(option => {
      return option.value === selectedValue.value;
    });
    return selectedOption ? selectedOption.label : '';
  }, [options, selectedValue]);

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm) {
      return options;
    }
    return options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]); 

  const handleSelect = (item) => { // item is { label: '...', value: '...' }
    onValueChange(item); // Pass the entire item object
    setModalVisible(false);
    setSearchTerm('');
    Keyboard.dismiss();
  };

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSearchTerm(''); // Reset search term on close
    Keyboard.dismiss();
  };
 

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.optionItem} onPress={() => handleSelect(item)}>
      <Text style={styles.optionText}>{item.label}</Text>
      {item.value === selectedValue && (
        <Ionicons name="checkmark-circle" size={20} color="green" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.pickerButton,{ borderColor}]} onPress={openModal}>
      <Image source={leadingIcon} style={{ width: 24, height: 24 }} tintColor={theme.dark? COLORS.primaryLight:COLORS.primary} />
        <Text style={[styles.pickerButtonText, !selectedLabel && styles.placeholderText,{ color:theme.dark? COLORS.primaryLight:COLORS.primary}]}>
          {selectedLabel || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color={theme.dark? COLORS.primaryLight:COLORS.primary} />
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="slide" // "fade" or "slide"
        onRequestClose={closeModal} // For Android back button
      >
        <SafeAreaView style={styles.modalOverlay}>  
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              
              <TextInput
                style={styles.searchInput}
                placeholder={searchPlaceholder}
                placeholderTextColor="#999"
                value={searchTerm}
                onChangeText={setSearchTerm}
                autoFocus={Platform.OS === 'ios'} //AutoFocus on iOS, Android can be buggy with modals
              />
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Ionicons name="close-circle" size={28} color="#555" />
              </TouchableOpacity>
            </View>

            {filteredOptions.length > 0 ? (
              <FlatList
                data={filteredOptions}
                renderItem={renderItem}
                keyExtractor={(item) => item.value.toString()}
                style={styles.optionsList}
                keyboardShouldPersistTaps="handled" // Important for TextInput interaction
              />
            ) : (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>{noResultsText}</Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  pickerButtonText: {
    fontSize: 16
  },
  placeholderText: {
    color: '#999',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    justifyContent: 'flex-end', // Aligns modal to the bottom
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10, // Adjust for safe area if needed
    maxHeight: SCREEN_HEIGHT * 0.7, // Max 70% of screen height
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9'
  },
  closeButton: {
    padding: 5,
  },
  optionsList: {
    // Styles for the list itself, if any
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  noResultsContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#777',
  },
});

export default CustomPicker;