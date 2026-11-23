import { NavigatorScreenParams, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SystemId } from '../types';

export type TabParamList = {
  Inicio: undefined;
  Diagnostico: undefined;
  Postos: undefined;
  Combustivel: undefined;
  Perfil: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  Connect: undefined;
  System: { id: SystemId };
  Codes: { focus?: string } | undefined;
  Report: { reportId?: string } | undefined;
  Refuel: undefined;
  History: undefined;
};

export const useNav = () => useNavigation<NativeStackNavigationProp<RootStackParamList>>();
