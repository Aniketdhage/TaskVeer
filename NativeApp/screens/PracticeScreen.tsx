import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PracticeScreen() {
  return (
    <SafeAreaView>
      <ScrollView>
        <View className="flex-1 items-center justify-center gap-4 bg-white p-2">
          <Text className="text-2xl font-bold">Practice Screen</Text>
          <View className="radius-50 h-52 w-full rounded-lg bg-amber-600"></View>
          <View className="radius-50 h-52 w-full rounded-lg bg-yellow-300"></View>
          <View className="radius-50 h-52 w-full rounded-lg bg-green-200"></View>
          <View className="radius-50 h-52 w-full rounded-lg bg-amber-600"></View>
          <View className="radius-50 h-52 w-full rounded-lg bg-yellow-300"></View>
          <View className="radius-50 h-52 w-full rounded-lg bg-green-200"></View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
