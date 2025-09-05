import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import DetailsScreen from './screens/DetailsScreen';
import ReviewScreen from './screens/ReviewScreen';
import ProfileScreen from './screens/ProfileScreen';
import ShareScreen from './screens/ShareScreen';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function TabsNav() {
  return (
    <Tabs.Navigator screenOptions={{headerShown:false}}>
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Profile" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}

export default function App(){
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} options={{headerShown:false}} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{title:'Criar conta'}} />
        <Stack.Screen name="Main" component={TabsNav} options={{headerShown:false}} />
        <Stack.Screen name="Details" component={DetailsScreen} options={{title:'Detalhes do Local'}} />
        <Stack.Screen name="Review" component={ReviewScreen} options={{title:'Avaliar'}} />
        <Stack.Screen name="Share" component={ShareScreen} options={{title:'Compartilhar'}} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
