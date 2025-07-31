import { COLORS, FONTS } from "@/constants/theme";
import { useCreateRma, useCustomerOrdersRMA, useOrderItemsRMA, useReasonsRMA, useResolutionsRMA } from "@/hooks/rmaHooks";
import { RootStackParamList } from "@/navigation/RootStackParamList";
import { RootState } from "@/redux/store";
import { StackScreenProps } from "@react-navigation/stack";
import { t } from "i18next";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  Dimensions,
  useWindowDimensions
} from "react-native";
import DropDownPicker from 'react-native-dropdown-picker';
import { Checkbox } from "react-native-paper";
import { useSelector } from "react-redux";
import * as ImagePicker from 'expo-image-picker';
import Header from "@/layout/Header";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { CreateRmaPayload, CustomerOrdersRMA } from "@/api/rmaApi";
import { notify } from "@/utils/notificationServices";

import { RouteProp, useRoute, useNavigation, NavigationProp } from '@react-navigation/native';
import CardBasedOrderSelection from "../Components/CardBasedOrderSelection";
import AccordionResolutionSelection from "../Components/AccordionResolutionSelection";
import ModalReasonSelection from "../Components/ModalReasonSelection ";
import { Feather } from "@expo/vector-icons";




type CreateRMAScreenProps = StackScreenProps<RootStackParamList, 'CreateRMA'>;

interface RMAItem {
  itemId: number;
  selected: boolean;
  reasonId?: number;
  quantity: number;
}

const CreateRMA = ({ navigation, route }: CreateRMAScreenProps) => {

  const dimensions = useWindowDimensions()
  const { onSuccessfullCreate, orderId } = route.params || {};
  const { userToken, user } = useSelector((state: RootState) => state.auth);
  const { reasons } = useReasonsRMA();
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Order selection state
  const { orders:apiOrders, isLoading, error, refetch } = useCustomerOrdersRMA(user?.id.toString());
  const [orders,setOrders] = useState<CustomerOrdersRMA[]>([])
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  // Resolution selection state
  const { resolutions, isLoading: isLoadingResolutions, error: errorResolutions } = useResolutionsRMA(selectedOrder);
  const [selectedResolution, setSelectedResolution] = useState<string | null>(null);

  // Order items state
  const { items: orderItems } = useOrderItemsRMA(selectedOrder);

  // RMA items state
  const [rmaItems, setRMAItems] = useState<RMAItem[]>([]);
 
  //additional fields
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([])
  const [additionalInfo, setAdditionalInfo] = useState('')


  // RMA creation

  const { createRma, createdRma, isLoading: isLoadingCreation, error: creationError } = useCreateRma();

  // Initialize RMA items when order items change

  useEffect(()=>{
    if(!isLoading && !error && orderId){
      const orderWithId = apiOrders?.find((o)=> o.info.includes(orderId?.toString()))
      if(orderWithId && orderWithId.id){
        setSelectedOrder(orderWithId.id)
        setOrders([orderWithId])

      }
    }

  },[apiOrders])


  useEffect(() => {
    if (orderItems) {
      setRMAItems(orderItems.map(item => ({
        itemId: Number(item.id),
        selected: false,
        reasonId: null,
        quantity: 1
      })));
    }
  }, [orderItems]);

  // Handle item selection
  const toggleItemSelection = (index: number) => {
    setRMAItems(prev => prev.map((item, i) =>
      i === index ? { ...item, selected: !item.selected } : item
    ));
  };

  // Handle reason selection
  const handleReasonChange = (index: number, reasonId: number) => {
    setRMAItems(prev => prev.map((item, i) =>
      i === index ? { ...item, reasonId } : item
    ));
  };

  // Handle quantity change
  const handleQuantityChange = (index: number, increment: boolean) => {
    const maxQty = orderItems?.[index]?.qty || 1;
    setRMAItems(prev => prev.map((item, i) => {
      if (i === index) {
        const newQty = increment ? item.quantity + 1 : item.quantity - 1;
        return {
          ...item,
          quantity: Math.max(1, Math.min(newQty, maxQty))
        };
      }
      return item;
    }));
  };

  // Handle image picker
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true
    });

    if (!result.canceled) {
      //const base64 = result.assets[0].base64;
      setImages(images.concat(result.assets[0]));
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = () => {
    if (isSubmitting) return;
    const selectedItems = rmaItems.filter(item => item.selected);

    if (!selectedOrder) {
      Alert.alert(t("error"), t("please_select_order"));
      return;
    }

    if (!selectedResolution) {
      Alert.alert(t("error"), t("please_select_resolution"));
      return;
    }

    if (selectedItems.length === 0) {
      Alert.alert(t("error"), t("please_select_items"));
      return;
    }

    const hasInvalidReasons = selectedItems.some(item => !item.reasonId);
    if (hasInvalidReasons) {
      Alert.alert(t("error"), t("please_select_reasons_for_all_items"));
      return;
    }
    var total_qty: Record<string, number> = {}
    var reason_ids: Record<string, number> = {}
    selectedItems.forEach((i) => {
      total_qty[i.itemId] = i.quantity
      reason_ids[i.itemId] = i.reasonId
    })

    const payload: CreateRmaPayload = {
      order_id: selectedOrder,
      item_ids: selectedItems.map((i) => i.itemId),
      reason_ids,
      total_qty,

      image: images.map((i) => i.base64),
      additional_info: additionalInfo,
      is_checked: true,
      is_virtual: false

    }
    //console.log("Submitting RMA:", JSON.stringify(payload));

    setIsSubmitting(true)
    notify(t("submitting_rma"))

    createRma(payload).then((_) => {
      setIsSubmitting(false)
      onSuccessfullCreate?.();


      navigation.goBack()

    }).catch((error) => {
      //notify(t("error_general"))
    }).finally(() => {
      setIsSubmitting(false)
      onSuccessfullCreate?.();

      navigation.goBack()
    })
  };



  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
        <Text style={styles.loadingText}>{t("loading_orders")}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <>
      <Header title={t("create_rma_request")} leftIcon="back" titleLeft />
      <View style={styles.errorContainer}>
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>⚠️ {t("error")}</Text>
          <Text style={styles.errorText}>{t("error_loading_orders")}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryButtonText}>{t("retry")}</Text>
          </TouchableOpacity>
        </View>
      </View>
      </>
    );
  }

  if(orders?.length==0){

    
    return (
      <>
      <Header title={t("create_rma_request")} leftIcon="back" titleLeft />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        
        <View
          style={{
            height: 60,
            width: 60,
            borderRadius: 30,           // half of width/height
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: COLORS.primaryLight,
            marginBottom: 20,
          }}
        >
          <Feather color={COLORS.primary} size={24} name="archive" />
        </View>
        <Text style={{ ...FONTS.h5, color: COLORS.title, marginBottom: 8 }}>
          {t('no_orders')}
        </Text>
        <Text
          style={{
            ...FONTS.fontSm,
            color: COLORS.text,
            textAlign: 'center',
            paddingHorizontal: 40,
          }}
        >
          {t('no_orders_eligible_for_return_request')}
        </Text>
      </View>
      </>
    )
  }



  const selectedItemsCount = rmaItems.filter(item => item.selected).length;

  return (
    <>
      <Header title={t("create_rma_request")} leftIcon="back" titleLeft />
      <KeyboardAwareScrollView style={styles.container} showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 0, flexGrow: 1, paddingBottom: 20 }} // add paddingBottom for button space
        enableOnAndroid
        extraScrollHeight={120}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressStep}>
              <View style={[styles.progressDot, selectedOrder ? styles.progressDotActive : {}]} />
              <Text style={[styles.progressLabel, selectedOrder ? styles.progressLabelActive : {}]}>
                {t("order")}
              </Text>
            </View>
            <View style={styles.progressLine} />
            <View style={styles.progressStep}>
              <View style={[styles.progressDot, selectedResolution ? styles.progressDotActive : {}]} />
              <Text style={[styles.progressLabel, selectedResolution ? styles.progressLabelActive : {}]}>
                {t("resolution")}
              </Text>
            </View>
            <View style={styles.progressLine} />
            <View style={styles.progressStep}>
              <View style={[styles.progressDot, selectedItemsCount > 0 ? styles.progressDotActive : {}]} />
              <Text style={[styles.progressLabel, selectedItemsCount > 0 ? styles.progressLabelActive : {}]}>
                {t("items")}
              </Text>
            </View>
          </View>

          {/* Order Selection */}


          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📦 {t("select_order")}</Text>
              <Text style={styles.sectionSubtitle}>{t("choose_order_for_return")}</Text>
            </View>

            {orders && (<CardBasedOrderSelection
              orders={orders}
              selectedOrder={selectedOrder}
              onSelectOrder={setSelectedOrder}
            />)}
          </View>

          {selectedOrder && !errorResolutions && !isLoadingResolutions && (
            <View style={styles.section}>


              <AccordionResolutionSelection
                resolutions={resolutions ?? []}
                selectedResolution={selectedResolution ?? ""}
                onSelectResolution={setSelectedResolution}
                isLoading={isLoadingResolutions}
              />
            </View>
          )}

          {/* Order Items */}
          {selectedResolution && selectedOrder && orderItems && orderItems.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>🛍️ {t("select_items_for_rma")}</Text>
                <Text style={styles.sectionSubtitle}>
                  {selectedItemsCount > 0
                    ? `${selectedItemsCount} ${t("items_selected")}`
                    : t("tap_items_to_select")
                  }
                </Text>
              </View>

              {orderItems.map((item, index) => (
                <View key={item.id} style={[
                  styles.itemCard,
                  rmaItems[index]?.selected && styles.itemCardSelected
                ]}>
                  <TouchableOpacity
                    style={styles.itemHeader}
                    onPress={() => toggleItemSelection(index)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.checkboxContainer}>
                      <Checkbox
                        status={rmaItems[index]?.selected ? 'checked' : 'unchecked'}
                        onPress={() => toggleItemSelection(index)}
                        color={COLORS.secondary}
                      />
                    </View>
                    <View style={styles.itemInfo}>
                      {item.image ? (
                        <Image source={{ uri: item.image }} style={styles.itemImage} />
                      ) : (
                        <View style={styles.placeholderImage}>
                          <Text style={styles.placeholderText}>📦</Text>
                        </View>
                      )}
                      <View style={styles.itemDetails}>
                        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                        <Text style={styles.itemPrice}>${item.price}</Text>
                        <View style={styles.sellerContainer}>
                          <Text style={styles.itemSeller}>{t("sold_by")}: {item.seller.seller_name}</Text>
                        </View>
                        <View style={styles.quantityBadge}>
                          <Text style={styles.quantityBadgeText}>{t("qty")}: {item.qty}</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {rmaItems[index]?.selected && (
                    <View style={styles.itemOptions}>
                      {/* Quantity Selector */}
                      <View style={styles.optionRow}>
                        <Text style={styles.optionLabel}>📊 {t("quantity")}:</Text>
                        <View style={styles.quantitySelector}>
                          <TouchableOpacity
                            style={[styles.quantityButton, styles.quantityButtonLeft]}
                            onPress={() => handleQuantityChange(index, false)}
                            disabled={rmaItems[index]?.quantity <= 1}
                          >
                            <Text style={styles.quantityButtonText}>−</Text>
                          </TouchableOpacity>
                          <View style={styles.quantityDisplay}>
                            <Text style={styles.quantityText}>{rmaItems[index]?.quantity}</Text>
                          </View>
                          <TouchableOpacity
                            style={[styles.quantityButton, styles.quantityButtonRight]}
                            onPress={() => handleQuantityChange(index, true)}
                            disabled={rmaItems[index]?.quantity >= item.qty}
                          >
                            <Text style={styles.quantityButtonText}>+</Text>
                          </TouchableOpacity>
                        <Text style={styles.maxQuantity}>of {item.qty}</Text>
                        </View>
                      </View>

                      {/* Reason Selection */}
                      <View style={styles.optionRow}>
                        <Text style={styles.optionLabel}>❓ {t("reason")}:</Text>
                        <View style={styles.reasonDropdownContainer}>
                          <ModalReasonSelection
                            reasons={reasons?? []}
                            selectedReason={rmaItems[index]?.reasonId}
                            onSelectReason={(reasonId) => handleReasonChange(index, reasonId)}
                            placeholder={t("select_reason")}
                            modalTitle={t("select_reason")}
                          />
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Additional Information Section */}
          {selectedResolution && selectedOrder &&  (<View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📝 {t("additional_information")}</Text>
              <Text style={styles.sectionSubtitle}>{t("help_us_understand_better")}</Text>
            </View>

            <View style={styles.additionalInfoCard}>
              {/* Image Upload */}
              <View style={styles.imageSection}>
                <Text style={styles.imageSectionTitle}>📷 {t("photos")} ({t("optional")})</Text>
                <TouchableOpacity
                  style={styles.imagePickerButton}
                  onPress={pickImage}
                >
                  <Text style={styles.imagePickerIcon}>📎</Text>
                  <Text style={styles.imagePickerText}>{t("add_photos")}</Text>
                </TouchableOpacity>

                {images && images.length > 0 && (
                  <View style={styles.imageGrid}>
                    {images.map((i, imgIndex: number) => (
                      <View key={imgIndex} style={styles.imageContainer}>
                        <Image source={{ uri: i.uri }} style={styles.previewImage} />
                        <TouchableOpacity
                          style={styles.removeImageButton}
                          onPress={() => removeImage(imgIndex)}
                        >
                          <Text style={styles.removeImageText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Description */}
              <View style={styles.descriptionSection}>
                <Text style={styles.descriptionTitle}>💬 {t("description")} ({t("optional")})</Text>
                <TextInput
                  style={styles.additionalInfoInput}
                  placeholder={t("describe_issue_detail")}
                  value={additionalInfo}
                  onChangeText={setAdditionalInfo}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>)}

          {/* Submit Button */}
          {selectedOrder && selectedResolution && selectedItemsCount > 0 && (
            <View style={styles.submitSection}>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  isSubmitting && styles.submitting,
                ]}
                disabled={isSubmitting}
                onPress={handleSubmit}
              >
                {isSubmitting
                  ? <ActivityIndicator color="#fff" />
                  : (<Text style={styles.submitButtonText}>
                    {t('submit_rma_request')}
                  </Text>)}
              </TouchableOpacity>
              <Text style={styles.submitNote}>
                {t("review_request_before_submitting")}
              </Text>
            </View>
          )}
        </View>
      </KeyboardAwareScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  errorCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },

  // Progress Indicator
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  progressStep: {
    alignItems: 'center',
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e2e8f0',
    marginBottom: 8,
  },
  progressDotActive: {
    backgroundColor: COLORS.secondary,
  },
  progressLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  progressLabelActive: {
    color: COLORS.secondary,
    fontWeight: '600',
  },
  progressLine: {
    height: 2,
    backgroundColor: '#e2e8f0',
    flex: 1,
    marginHorizontal: 12,
  },

  // Section Styles
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },

  // Dropdown Styles
  dropdownWrapper: {
    zIndex: 1000,
  },
  dropdown: {
    borderColor: '#e2e8f0',
    borderRadius: 12,
    minHeight: 56,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  dropdownContainer: {
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  dropdownText: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  dropdownPlaceholder: {
    color: '#94a3b8',
  },

  // Item Card Styles
  itemCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  itemCardSelected: {
    borderColor: COLORS.secondary,
    backgroundColor: '#fefefe',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: '#f1f5f9',
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 6,
    lineHeight: 22,
  },
  itemPrice: {
    fontSize: 18,
    color: COLORS.secondary,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  sellerContainer: {
    marginBottom: 8,
  },
  itemSeller: {
    fontSize: 14,
    color: '#64748b',
  },
  quantityBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  quantityBadgeText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },

  // Item Options
  itemOptions: {
    backgroundColor: '#f8fafc',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  optionRow: {
    marginBottom: 20,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },

  // Quantity Selector
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    marginRight: 12,
  },
  quantityButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonLeft: {
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  quantityButtonRight: {
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  quantityDisplay: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  maxQuantity: {
    fontSize: 14,
    color: '#64748b',
    alignSelf: 'center',
  },

  // Reason Dropdown
  reasonDropdownContainer: {
    flex: 1,
    zIndex: 100,
  },
  reasonDropdown: {
    borderColor: '#e2e8f0',
    borderRadius: 12,
    minHeight: 48,
    backgroundColor: 'white',
  },

  // Additional Info
  additionalInfoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  imageSection: {
    marginBottom: 24,
  },
  imageSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  imagePickerIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  imagePickerText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '500',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    gap: 12,
  },
  imageContainer: {
    position: 'relative',
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  descriptionSection: {
    marginBottom: 0,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  additionalInfoInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: 'white',
    textAlignVertical: 'top',
    minHeight: 100,
    color: '#1e293b',
  },

  // Submit Section
  submitSection: {
    marginTop: 12,
    marginBottom: 40,
  },
  submitButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  submitting: {
    // pick whichever effects you want:
    opacity: 0.6,                   // fade the button
    backgroundColor: COLORS.gray,   // or a different colour
    shadowOpacity: 0,               // maybe no shadow
  },
  submitButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  submitNote: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
  },
});

export default CreateRMA;