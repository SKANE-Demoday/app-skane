import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppProvider } from './src/context/AppContext';
import { RootStackParamList, TabParamList } from './src/navigation/types';
import { colors } from './src/theme';
import HomeScreen from './src/screens/HomeScreen';
import ConnectScreen from './src/screens/ConnectScreen';
import { CodesScreen, DiagnosticScreen, SystemScreen } from './src/screens/DiagnosticScreens';
import { HistoryScreen, ReportScreen } from './src/screens/ReportScreens';
import { FuelScreen, RefuelScreen, StationsScreen } from './src/screens/FuelScreens';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const TAB_ICONS: Record<keyof TabParamList, keyof typeof MaterialCommunityIcons.glyphMap> = {
  Inicio: 'home',
  Diagnostico: 'chip',
  Postos: 'map-marker-outline',
  Combustivel: 'car-outline',
  Perfil: 'account-circle-outline',
};

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.blue,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 11 },
        tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name={TAB_ICONS[route.name]} size={size} color={color} />,
      })}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} options={{ title: 'Início' }} />
      <Tab.Screen name="Diagnostico" component={DiagnosticScreen} options={{ title: 'Diagnóstico' }} />
      <Tab.Screen name="Postos" component={StationsScreen} />
      <Tab.Screen name="Combustivel" component={FuelScreen} options={{ title: 'Combustível' }} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const theme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: colors.bg } };

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <NavigationContainer theme={theme}>
          <StatusBar style="dark" />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Tabs" component={Tabs} />
            <Stack.Screen name="Connect" component={ConnectScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="System" component={SystemScreen} />
            <Stack.Screen name="Codes" component={CodesScreen} />
            <Stack.Screen name="Report" component={ReportScreen} />
            <Stack.Screen name="Refuel" component={RefuelScreen} />
            <Stack.Screen name="History" component={HistoryScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}
