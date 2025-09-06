import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import TaskListScreen from './screens/TaskListScreen';
import QrScannerScreen from './screens/QrScannerScreen';
import QrCodeDisplayScreen from './screens/QrCodeDisplayScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="TaskList">
        <Stack.Screen name="TaskList" component={TaskListScreen} options={{ title: 'My Tasks' }} />
        <Stack.Screen name="QrScanner" component={QrScannerScreen} options={{ title: 'Scan QR Code' }} />
        <Stack.Screen name="QrCodeDisplay" component={QrCodeDisplayScreen} options={{ title: 'Share Collection' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
