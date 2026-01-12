import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SoilAnalyzerScreen from '../screens/SoilAnalyzerScreen';

import WeatherForecastScreen from '../screens/WeatherForecastScreen';
import SoilHealthScreen from '../screens/SoilHealthScreen';
import SmartAdvisoryScreen from '../screens/SmartAdvisoryScreen';
import IrrigationScheduleScreen from '../screens/IrrigationScheduleScreen';


const Stack = createNativeStackNavigator();

const SoilStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SoilAnalyzerMain" component={SoilAnalyzerScreen} />
      <Stack.Screen name="WeatherForecast" component={WeatherForecastScreen} />
      <Stack.Screen name="SoilHealth" component={SoilHealthScreen} />
      <Stack.Screen name="SmartAdvisory" component={SmartAdvisoryScreen} />
      <Stack.Screen name="IrrigationSchedule" component={IrrigationScheduleScreen} />
    </Stack.Navigator>
  );
};

export default SoilStackNavigator;
