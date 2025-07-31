

// AccordionResolutionSelection.js

import { ResolutionsRMA } from "@/api/rmaApi";
import { COLORS } from "@/constants/theme";
import { useState } from "react";
import { LayoutAnimation, Platform, StyleSheet, TouchableOpacity, UIManager, View,Text } from "react-native";

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
interface AccordionResolutionSelectionProps {
  resolutions: ResolutionsRMA[],
  selectedResolution: string,
  onSelectResolution: (id: string)=> void,
  isLoading: boolean
}

const AccordionResolutionSelection = ({ 
  resolutions, 
  selectedResolution, 
  onSelectResolution,
  isLoading 
} : AccordionResolutionSelectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleAccordion = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  const handleSelectResolution = (resolutionId:string) => {
    onSelectResolution(resolutionId);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(false);
  };

  const selectedResolutionName = selectedResolution 
    ? resolutions?.find(r => r.id === selectedResolution)?.name 
    : null;

  return (
    <View style={styles.accordionContainer}>
      <TouchableOpacity
        style={[
          styles.accordionHeader,
          isExpanded && styles.accordionHeaderExpanded,
          selectedResolution && styles.accordionHeaderSelected
        ]}
        onPress={toggleAccordion}
        disabled={isLoading}
      >
        <View style={styles.accordionHeaderContent}>
          <View style={styles.accordionLeft}>
            <Text style={styles.accordionIcon}>🔄</Text>
            <View>
              <Text style={styles.accordionTitle}>
                {selectedResolutionName || 'Select Resolution Type'}
              </Text>
              <Text style={styles.accordionSubtitle}>
                {selectedResolutionName 
                  ? 'Tap to change resolution' 
                  : 'How would you like to resolve this?'
                }
              </Text>
            </View>
          </View>
          <Text style={[
            styles.chevron,
            isExpanded && styles.chevronExpanded
          ]}>
            ▼
          </Text>
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.accordionContent}>
          {resolutions?.map((resolution, index) => (
            <TouchableOpacity
              key={resolution.id}
              style={[
                styles.resolutionOption,
                index === resolutions.length - 1 && styles.resolutionOptionLast,
                selectedResolution === resolution.id.toString() && styles.resolutionOptionSelected
              ]}
              onPress={() => handleSelectResolution(resolution.id)}
            >
              <View style={styles.resolutionContent}>
                <View style={styles.resolutionLeft}>
                  <Text style={styles.resolutionName}>{resolution.name}</Text>
                  {resolution.name && (
                    <Text style={styles.resolutionDescription}>{resolution.name}</Text>
                  )}
                </View>
                {selectedResolution === resolution.id.toString() && (
                  <Text style={styles.selectedIndicator}>✓</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};


export default AccordionResolutionSelection;

  // Accordion Resolution Selection Styles
 const styles =  StyleSheet.create({accordionContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  accordionHeader: {
    padding: 16,
    backgroundColor: '#fff',
  },
  accordionHeaderExpanded: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  accordionHeaderSelected: {
    backgroundColor: '#f8faff',
  },
  accordionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accordionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accordionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  accordionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  chevron: {
    fontSize: 12,
    color: '#999',
    transform: [{ rotate: '0deg' }],
  },
  chevronExpanded: {
    transform: [{ rotate: '180deg' }],
  },
  accordionContent: {
    backgroundColor: '#fafafa',
  },
  resolutionOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resolutionOptionLast: {
    borderBottomWidth: 0,
  },
  resolutionOptionSelected: {
    backgroundColor: '#f0f8ff',
  },
  resolutionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resolutionLeft: {
    flex: 1,
  },
  resolutionName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  resolutionDescription: {
    fontSize: 14,
    color: '#666',
  },
  selectedIndicator: {
    fontSize: 16,
    color: COLORS.secondary || '#007AFF',
    fontWeight: 'bold',
  },

})