import { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ScreenWrapperProps = {
  children: ReactNode;
  scrollable?: boolean;
};

export default function ScreenWrapper({ children, scrollable = false }: ScreenWrapperProps) {
  if (scrollable) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 40,
          }}>
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white px-4 pt-4">
      <View className="flex-1">{children}</View>
    </SafeAreaView>
  );
}
