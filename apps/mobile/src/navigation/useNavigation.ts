// ==============================================
// Navigation Hook
// ==============================================

import { useNavigation as useNavigationBase } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';

export type RootStackNavigation = StackNavigationProp<RootStackParamList>;

export function useNavigation() {
  return useNavigationBase<RootStackNavigation>();
}
