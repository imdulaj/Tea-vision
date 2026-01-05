import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SoilAnalyzerScreen from '../screens/SoilAnalyzerScreen';
import WeatherForecastScreen from '../screens/WeatherForecastScreen';

const Stack = createNativeStackNavigator();

const SoilStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SoilAnalyzerMain" component={SoilAnalyzerScreen} />
      <Stack.Screen name="WeatherForecast" component={WeatherForecastScreen} />
    </Stack.Navigator>
  );
};

export default SoilStackNavigator;
