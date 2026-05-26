import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../App';

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="mb-8 text-2xl font-bold">Welcome</Text>
      <TouchableOpacity
        onPress={() => navigation.navigate('Practice')}
        className="mb-6 rounded-lg bg-blue-500 px-8 py-3">
        <Text className="font-semibold text-white">Go To Practice</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate('Login')}
        className="rounded-lg bg-amber-400 px-8 py-3">
        <Text className="font-semibold text-white">Go To Login</Text>
      </TouchableOpacity>
    </View>
  );
}
