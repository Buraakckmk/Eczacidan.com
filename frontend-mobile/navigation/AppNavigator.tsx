import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AccountScreen } from '../screens/AccountScreen';
import { CartScreen } from '../screens/CartScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.iconText, focused && styles.iconActive]}>
        {label === 'Pazaryeri' ? '🏪' : label === 'Sepetim' ? '🛒' : '👤'}
      </Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#EA580C',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
        },
      }}
    >
      <Tab.Screen
        name="PazaryeriTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Pazaryeri',
          tabBarIcon: ({ focused }) => <TabIcon label="Pazaryeri" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="SepetimTab"
        component={CartScreen}
        options={{
          tabBarLabel: 'Sepetim',
          tabBarIcon: ({ focused }) => <TabIcon label="Sepetim" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="HesabımTab"
        component={AccountScreen}
        options={{
          tabBarLabel: 'Hesabım',
          tabBarIcon: ({ focused }) => <TabIcon label="Hesabım" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ headerShown: true, title: 'İlan Detayı', headerTintColor: '#EA580C' }}
      />
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 18,
  },
  iconActive: {
    transform: [{ scale: 1.1 }],
  },
});
