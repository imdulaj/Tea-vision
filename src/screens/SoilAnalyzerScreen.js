import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Droplet,
  Thermometer,
  MapPin,
  Bell,
} from 'lucide-react-native';

import { COLORS, SIZES } from '../constants/Theme';
import useLiveLocation from '../hooks/useLiveLocation';
import {
  getWeather,
  getThreeDayForecast,
} from '../services/weatherService';