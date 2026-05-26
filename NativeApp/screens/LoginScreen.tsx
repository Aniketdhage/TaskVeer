import ScreenWrapper from 'components/common/ScreenWrapper';
import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../App';

const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [formInput, setFormInput] = useState({
    userName: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!formInput.password || !formInput.userName) {
      setError('Both fields are mandatory');
      return;
    }

    // Store values in local variables before async operation
    const enteredEmail = formInput.userName;
    const enteredPassword = formInput.password;

    setError('');
    AsyncStorage.getItem('user')
      .then((userData) => {
        console.log('Retrieved user data:', userData);

        if (!userData) {
          setError('No account found. Please sign up first.');
          return;
        }

        const storedUser = JSON.parse(userData);
        console.log('Parsed user:', storedUser);
        console.log('Entered email:', enteredEmail);
        console.log('Entered password:', enteredPassword);

        // Check if email/username matches
        const emailMatches = enteredEmail?.toLowerCase() === storedUser?.email?.toLowerCase();

        // Check if password matches
        const passwordMatches = enteredPassword === storedUser.password;

        console.log('Email matches:', emailMatches);
        console.log('Password matches:', passwordMatches);

        if (emailMatches && passwordMatches) {
          setError('');
          setFormInput({ userName: '', password: '' });
          // Navigate to Home screen
          navigation.navigate('Home');
        } else if (!emailMatches) {
          setError('Email not found. Please check your email or sign up.');
        } else {
          setError('Incorrect password. Please try again.');
        }
      })
      .catch((err) => {
        console.error('AsyncStorage error:', err);
        setError('No account found. Please sign up first.');
      });
  };

  return (
    <ScreenWrapper>
      <View className="flex-1 justify-center px-6">
        {/* Header Section */}
        <View className="mb-12">
          <Text className="text-4xl font-bold text-gray-900">Welcome Back</Text>
          <Text className="mt-2 text-lg text-gray-500">Sign in to your account</Text>
        </View>

        {/* Form Section */}
        <View className="gap-4">
          {/* Username Input */}
          <View>
            <Text className="mb-2 text-sm font-semibold text-gray-700">Username or Email</Text>
            <TextInput
              placeholder="Enter your username"
              onChangeText={(newText) => setFormInput({ ...formInput, userName: newText })}
              value={formInput.userName}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900"
              placeholderTextColor="#999"
              keyboardType="email-address"
            />
          </View>

          {/* Password Input */}
          <View>
            <Text className="mb-2 text-sm font-semibold text-gray-700">Password</Text>
            <TextInput
              placeholder="Enter your password"
              onChangeText={(newText) => setFormInput({ ...formInput, password: newText })}
              value={formInput.password}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900"
              placeholderTextColor="#999"
              secureTextEntry={true}
            />
          </View>

          {/* Error Message */}
          {error && (
            <View className="flex-row items-center gap-2 rounded-lg bg-red-50 p-3">
              <Text className="text-sm font-semibold text-red-600">{error}</Text>
            </View>
          )}

          {/* Login Button */}

          <TouchableOpacity
            onPress={handleSubmit}
            className="mt-6 flex-row items-center justify-center rounded-xl bg-blue-600 px-6 py-4"
            activeOpacity={0.8}>
            <Text className="text-base font-bold text-white">Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Section */}
        <View className="mt-8 flex-row items-center justify-center gap-1">
          <Text className="text-sm text-gray-600">Don&apos;t have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')} activeOpacity={0.7}>
            <Text className="text-sm font-semibold text-blue-600">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default LoginScreen;
