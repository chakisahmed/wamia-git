// app/notifications/NotificationProvider.tsx
import React, { createContext, useCallback, useState, useEffect, ReactNode, useRef } from 'react';
import { 
  Animated, 
  Text, 
  Dimensions, 
  StyleSheet, 
  View, 
  TouchableOpacity,
  Platform,
  StatusBar,
  Vibration
} from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { registerNotification } from '@/utils/notificationServices';
import { t } from 'i18next';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'network';

export interface NotificationConfig {
  message: string;
  type?: NotificationType;
  duration?: number;
  persistent?: boolean;
  vibrate?: boolean;
  onPress?: () => void;
  icon?: string;
}

type NotificationContextType = {
  showNotification: (config: string | NotificationConfig) => void;
  hideNotification: () => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
};

export const NotificationContext = createContext<NotificationContextType>({
  showNotification: () => {},
  hideNotification: () => {},
  showSuccess: () => {},
  showError: () => {},
  showWarning: () => {},
  showInfo: () => {},
});

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Enhanced ping check with better error handling
const checkPing = async (): Promise<number | null> => {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    await fetch('https://www.google.com', { 
      method: 'HEAD',
      signal: controller.signal,
      cache: 'no-cache'
    });
    
    clearTimeout(timeoutId);
    const duration = Date.now() - start;
    return duration;
  } catch (error) {
    return null;
  }
};

// Notification type configurations
const NOTIFICATION_CONFIGS = {
  info: {
    colors: ['#3B82F6', '#1E40AF'],
    icon: 'information-circle',
    vibrationPattern: [100],
  },
  success: {
    colors: ['#10B981', '#059669'],
    icon: 'checkmark-circle',
    vibrationPattern: [100, 50, 100],
  },
  warning: {
    colors: ['#F59E0B', '#D97706'],
    icon: 'warning',
    vibrationPattern: [200, 100, 200],
  },
  error: {
    colors: ['#EF4444', '#DC2626'],
    icon: 'close-circle',
    vibrationPattern: [300, 100, 300, 100, 300],
  },
  network: {
    colors: ['#F59E0B', '#D97706'],
    icon: 'wifi-outline',
    vibrationPattern: [150],
  },
};

interface NotificationState {
  message: string;
  type: NotificationType;
  persistent: boolean;
  onPress?: () => void;
  icon?: string;
}

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const translateY = useRef(new Animated.Value(-200)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  const hideTimeout = useRef<NodeJS.Timeout>();
  const netInfo = useNetInfo();
  const lastNetworkStatus = useRef<string>('');

  const hideNotification = useCallback(() => {
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
    }
    
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -200,
        useNativeDriver: true,
        duration: 300,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        useNativeDriver: true,
        duration: 300,
      }),
      Animated.timing(scale, {
        toValue: 0.8,
        useNativeDriver: true,
        duration: 300,
      }),
    ]).start(() => setNotification(null));
  }, [translateY, opacity, scale]);

  const showNotification = useCallback((config: string | NotificationConfig) => {
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
    }

    const notificationConfig: NotificationConfig = typeof config === 'string' 
      ? { message: config, type: 'info' }
      : config;

    const {
      message,
      type = 'info',
      duration = 4000,
      persistent = false,
      vibrate = true,
      onPress,
      icon
    } = notificationConfig;

    // Vibration feedback
    if (vibrate && Platform.OS === 'ios') {
      Vibration.vibrate(NOTIFICATION_CONFIGS[type].vibrationPattern);
    } else if (vibrate && Platform.OS === 'android') {
      Vibration.vibrate(NOTIFICATION_CONFIGS[type].vibrationPattern);
    }

    setNotification({
      message,
      type,
      persistent,
      onPress,
      icon: icon || NOTIFICATION_CONFIGS[type].icon
    });

    // Animate in
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        useNativeDriver: true,
        duration: 400,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
    ]).start();

    // Auto-hide unless persistent
    if (!persistent) {
      hideTimeout.current = setTimeout(hideNotification, duration);
    }
  }, [translateY, opacity, scale, hideNotification]);

  // Convenience methods
  const showSuccess = useCallback((message: string) => {
    showNotification({ message, type: 'success' });
  }, [showNotification]);

  const showError = useCallback((message: string) => {
    showNotification({ message, type: 'error', duration: 6000 });
  }, [showNotification]);

  const showWarning = useCallback((message: string) => {
    showNotification({ message, type: 'warning', duration: 5000 });
  }, [showNotification]);

  const showInfo = useCallback((message: string) => {
    showNotification({ message, type: 'info' });
  }, [showNotification]);

  // Register notification service
  useEffect(() => {
    registerNotification(showNotification);
  }, [showNotification]);

  // Enhanced network monitoring
  useEffect(() => {
    const currentStatus = `${netInfo.isConnected}-${netInfo.type}-${netInfo.isInternetReachable}`;
    
    // Skip first render to avoid initial notification
    if (lastNetworkStatus.current === '') {
      lastNetworkStatus.current = currentStatus;
      return;
    }

    // Status changed
    if (lastNetworkStatus.current !== currentStatus) {
      lastNetworkStatus.current = currentStatus;

      if (netInfo.isConnected === false) {
        showNotification({
          message: t('no_internet'),
          type: 'network',
          persistent: true,
          icon: 'wifi-outline',
          onPress: () => {
            // Could open network settings or retry
          }
        });
      } else if (netInfo.isConnected && netInfo.isInternetReachable) {
        // Hide persistent network notification if it exists
        if (notification?.type === 'network' && notification?.persistent) {
          hideNotification();
        }
        
        // Check connection quality
        if (netInfo.type === 'cellular' && netInfo.details?.cellularGeneration) {
          const generation = netInfo.details.cellularGeneration;
          if (['2g', 'slow-2g'].includes(generation)) {
            showNotification({
              message: t('slow_connection'),
              type: 'warning',
              duration: 3000,
              icon: 'cellular'
            });
          }
        } else if (netInfo.type === 'wifi') {
          // Check WiFi quality
          checkPing().then((ping) => {
            if (ping === null) {
              showNotification({
                message: t('no_internet'),
                type: 'error',
                duration: 4000
              });
            } else if (ping > 3000) {
              showNotification({
                message: t('wifi_very_slow'),
                type: 'warning',
                duration: 3000,
                icon: 'wifi'
              });
            } else if (ping > 1000) {
              showNotification({
                message: t('wifi_slow'),
                type: 'info',
                duration: 2000,
                icon: 'wifi'
              });
            }
          });
        }
      }
    }
  }, [netInfo, showNotification, hideNotification, notification]);

  const handleNotificationPress = () => {
    if (notification?.onPress) {
      notification.onPress();
    }
    if (!notification?.persistent) {
      hideNotification();
    }
  };

  const renderNotification = () => {
    if (!notification) return null;

    const config = NOTIFICATION_CONFIGS[notification.type];
    const isInteractive = !!notification.onPress || !notification.persistent;

    return (
      <Animated.View
        style={[
          styles.container,
          {
            transform: [
              { translateY },
              { scale }
            ],
            opacity
          }
        ]}
      >
        <TouchableOpacity
          style={styles.touchable}
          onPress={handleNotificationPress}
          disabled={!isInteractive}
          activeOpacity={isInteractive ? 0.8 : 1}
        >
          <BlurView intensity={90} style={styles.blurContainer}>
            <LinearGradient
              colors={[...config.colors, config.colors[0] + '20']}
              style={styles.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.content}>
                <View style={styles.iconContainer}>
                  <Ionicons 
                    name={notification.icon as any} 
                    size={24} 
                    color="#fff" 
                  />
                </View>
                
                <Text style={styles.message} numberOfLines={2}>
                  {notification.message}
                </Text>
                
                {!notification.persistent && (
                  <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={hideNotification}
                  >
                    <Ionicons name="close" size={20} color="#fff" />
                  </TouchableOpacity>
                )}
              </View>
              
              {/* Progress indicator for non-persistent notifications */}
              {!notification.persistent && (
                <View style={styles.progressContainer}>
                  <Animated.View style={styles.progressBar} />
                </View>
              )}
            </LinearGradient>
          </BlurView>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <NotificationContext.Provider value={{ 
      showNotification, 
      hideNotification,
      showSuccess,
      showError,
      showWarning,
      showInfo
    }}>
      {children}
      {renderNotification()}
    </NotificationContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 0) + 10,
    left: 16,
    right: 16,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
  },
  touchable: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  blurContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradient: {
    borderRadius: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 56,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    lineHeight: 20,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  progressContainer: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    width: '100%',
  },
});

// Hook for using notifications
export const useNotifications = () => {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};