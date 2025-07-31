import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  FlatList,
  Platform,
  KeyboardAvoidingView,
  Animated,
  TextInput,
  Keyboard
} from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import { t } from "i18next";

import { useRmaDetails, useSendRMAMessage } from "@/hooks/rmaHooks";
import Header from "@/layout/Header";
import { RootStackParamList } from "@/navigation/RootStackParamList";
import { useRmaDetailsMock } from "@/hooks/useMockRmaDetails"
import { formatDate } from "@/utils/helpers";
import { ConversationRMA } from "@/api/rmaApi";

type RMADetailsScreenProps = StackScreenProps<RootStackParamList, 'RMADetails'>;

const RMADetails = ({ navigation, route }: RMADetailsScreenProps) => {

  // Chat animation states
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [messageText, setMessageText] = useState('');
  const chatAnimationValue = useRef(new Animated.Value(0)).current;
  const scrollOffsetY = useRef(0);

  const { rmaId } = route.params;
  const { rmaDetails, isLoading, error, refetch } = useRmaDetails(rmaId)//; useRmaDetailsMock(rmaId)
  const { sendMessage, isLoading: isSendingMessage, sentMessage } = useSendRMAMessage();
  const [messages,setMessages] = useState<ConversationRMA[]>([])

  useEffect(() => {
    setMessages(rmaDetails?.conversations?.toReversed() ?? [])
  }, [rmaDetails])

  // Handle scroll for chat animation
  const handleScroll = (event: any) => {

    const currentScrollY = event.nativeEvent.contentOffset.y;
    scrollOffsetY.current = currentScrollY;

    // Show chat when scrolled down more than 200px
    if (currentScrollY > 69 && !isChatVisible) {
      setIsChatVisible(true);
      Animated.spring(chatAnimationValue, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else if (currentScrollY <= 100 && isChatVisible) {
      // Hide chat when scrolled back to top
      Animated.spring(chatAnimationValue, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start(() => {
        if (scrollOffsetY.current <= 100) {
          setIsChatVisible(false);
        }
      });
    }
  };

const handleSendMessage = async () => {
  Keyboard.dismiss()
  if (messageText.trim() && !isSendingMessage) {
    const optimisticMessage: ConversationRMA = {
      id: Date.now(), // Temporary ID
      sender: 'You', // Or current user name
      senderType: '2',
      message: messageText.trim(),
      createdTime: new Date().toISOString()
    };

    // Optimistically add message to UI
    setMessages((prev) => [...prev, optimisticMessage]);
    const originalMessageText = messageText.trim();
    setMessageText('');

    try {
      const newMessage = await sendMessage({
        message: originalMessageText,
        sender_type: 2,
        rma_id: parseInt(rmaId)
      });
      
      // Replace optimistic message with real one
      setMessages((prev) => 
        prev.map(msg => 
          msg.id === optimisticMessage.id ? newMessage : msg
        )
      );
    } catch (error) {
      // Remove optimistic message on failure
      setMessages((prev) => 
        prev.filter(msg => msg.id !== optimisticMessage.id)
      );
      setMessageText(originalMessageText); // Restore text
      console.error('Failed to send message:', error);
    }
  }
};


  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'En attente':
        return '#FF9500';
      case 'Declined':
        return '#FF3B30';
      case 'Annulée':
        return 'red';
      case 'En cours de traitement':
        return '#007AFF';
      case 'Résolu':
        return '#34C759';
      default:
        return '#8E8E93';
    }
  };



  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.loadingText}>{t("loadingRMADetails")}</Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>{t("errorLoadingRMA")}</Text>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
        <Text style={styles.retryButtonText}>{t("goBack")}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStatusSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t("rmaStatus")}</Text>
      <View style={styles.statusContainer}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(rmaDetails?.rmaStatus) }]}>
          <Text style={styles.statusText}>{rmaDetails.rmaStatus?.toUpperCase()}</Text>
        </View>
        <View style={styles.statusInfo}>
          <Text style={styles.statusLabel}>{t("orderReference")}</Text>
          <Text style={styles.statusValue}>{rmaDetails.orderRef}</Text>
        </View>
      </View>
    </View>
  );

  const renderDetailsSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t("rmaDetails")}</Text>
      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>{t("dateCreated")}</Text>
          <Text style={styles.detailValue}>{formatDate(rmaDetails.createdDate)}</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>{t("orderStatus")}</Text>
          <Text style={styles.detailValue}>{rmaDetails.orderStatus || t("notAvailable")}</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>{t("resolutionType")}</Text>
          <Text style={styles.detailValue}>{rmaDetails.resolutionType || t("notAvailable")}</Text>
        </View>
      </View>

      {rmaDetails.additionalInfo && (
        <View style={styles.additionalInfoContainer}>
          <Text style={styles.detailLabel}>{t("additionalInfo")}</Text>
          <Text style={styles.additionalInfoText}>{rmaDetails.additionalInfo}</Text>
        </View>
      )}
    </View>
  );

  const renderProductsSection = () => {
    if (!rmaDetails.product?.length) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("products")} ({rmaDetails.product.length})</Text>
        {rmaDetails.product.map((product, index) => (
          <View key={index} style={styles.productCard}>
            <View style={styles.productHeader}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productPrice}>{product.price}</Text>
            </View>

            <View style={styles.productDetails}>
              <View style={styles.productDetailItem}>
                <Text style={styles.productDetailLabel}>{t("quantity")}</Text>
                <Text style={styles.productDetailValue}>{product.qty}</Text>
              </View>

              <View style={styles.productDetailItem}>
                <Text style={styles.productDetailLabel}>{t("reason")}</Text>
                <Text style={styles.productDetailValue}>{product.reason}</Text>
              </View>

              {product.customer?.email && (
                <View style={styles.productDetailItem}>
                  <Text style={styles.productDetailLabel}>{t("sellerEmail")}</Text>
                  <Text style={styles.productDetailValue}>{product.customer.email}</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderAdditionalInfoSection = () => {
    if (!rmaDetails?.additionalInfo) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("additional_info")}</Text>
      </View>
    )
  }

  const renderConversationsSection = () => {
    if (!messages?.length) return (
    <View style={styles.section}>

    <Text style={styles.sectionTitle}>{t("conversations")}</Text>
    <Text style={styles.noMessagesText}>{t("no_messages")}</Text>

    </View>
  );

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("conversations")} ({messages.length})</Text>
        {messages.map((conversation, index) => (
          <View key={index} style={styles.conversationCard}>
            <View style={styles.conversationHeader}>
              <View style={styles.senderInfo}>
                <Text style={styles.senderName}>{conversation.sender}</Text>
                <Text style={styles.senderType}>({conversation.senderType})</Text>
              </View>
              <Text style={styles.conversationDate}>{formatDate(conversation.createdTime)}</Text>
            </View>
            <Text style={styles.conversationMessage}>{conversation.message}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderImagesSection = () => {
    if (!rmaDetails.images?.length) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("attachedImages")} ({rmaDetails.images.length})</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
          {rmaDetails.images.map((image, index) => (
            <TouchableOpacity key={index} style={styles.imageContainer}>
              <Image source={{ uri: image }} style={styles.attachedImage} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };
  const renderSlidingChat = () => {
    if (!isChatVisible) return null;

    const translateY = chatAnimationValue.interpolate({
      inputRange: [0, 1],
      outputRange: [200, 0],
    });

    const opacity = chatAnimationValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return (
      <Animated.View
        style={[
          styles.chatContainer,
          {
            transform: [{ translateY }],
            opacity,
          }
        ]}
      >
        <View style={styles.chatHeader}>
          <Text style={styles.chatTitle}>{t("quick_message")}</Text>
          <TouchableOpacity
            style={styles.chatCloseButton}
            onPress={() => {
              Animated.spring(chatAnimationValue, {
                toValue: 0,
                useNativeDriver: true,
              }).start(() => setIsChatVisible(false));
            }}
          >
            <Text style={styles.chatCloseText}>×</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.chatInputContainer}>
          <TextInput
            style={styles.chatInput}
            value={messageText}
            onChangeText={setMessageText}
            placeholder={t("type_your_message")}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, { opacity: messageText.trim() ? 1 : 0.5 }]}
            onPress={handleSendMessage}
            disabled={!messageText.trim() || isSendingMessage}
          >
            {isSendingMessage ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.sendButtonText}>→</Text>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };


  if (isLoading) return renderLoadingState();
  if (error) return renderErrorState();
  if (!rmaDetails) return renderErrorState();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header title={`RMA #${rmaId}`} leftIcon="back" titleLeft />
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {renderStatusSection()}
        {renderDetailsSection()}
        {renderProductsSection()}
        {renderAdditionalInfoSection()}
        {renderImagesSection()}
        {renderConversationsSection()}
        <View style={{ height: 200 }} />
      </ScrollView>
      {renderSlidingChat()}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF3B30',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  noMessagesText:{
    fontSize:14,
    color: '#999999',
    marginBottom:14
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 2,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  detailItem: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  additionalInfoContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    paddingTop: 16,
    marginTop: 8,
  },
  additionalInfoText: {
    fontSize: 14,
    color: '#1C1C1E',
    lineHeight: 20,
    marginTop: 4,
  },
  productCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
  },
  productDetails: {
    gap: 8,
  },
  productDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productDetailLabel: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  productDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
    textAlign: 'right',
  },
  conversationCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  senderName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginRight: 4,
  },
  senderType: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  conversationDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  conversationMessage: {
    fontSize: 14,
    color: '#1C1C1E',
    lineHeight: 20,
  },
  imagesContainer: {
    flexDirection: 'row',
  },
  imageContainer: {
    marginRight: 12,
  },
  attachedImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  // Chat animation styles
  chatContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24, // Account for safe area
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  chatCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatCloseText: {
    fontSize: 20,
    color: '#8E8E93',
    fontWeight: '300',
  },
  chatInputContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-end',
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5E7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
    backgroundColor: '#F8F8F8',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom:10
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});


export default RMADetails;