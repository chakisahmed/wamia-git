import { StyleSheet } from 'react-native';
import { COLORS } from './theme';

export const categoryImageStyle = StyleSheet.create({
  container: {
    height: 60,
    width: 60,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});