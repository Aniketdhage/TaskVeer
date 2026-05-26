import ScreenWrapper from 'components/common/ScreenWrapper';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RootStackParamList } from '../App';

const SignUpScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [formInput, setFormInput] = useState({
    fullName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = () => {
    if (!formInput.fullName || !formInput.email || !formInput.password) {
      setError('All fields are mandatory');
      return;
    }

    if (!validateEmail(formInput.email)) {
      setError('Please enter a valid email');
      return;
    }

    if (formInput.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (isMounted) {
      const newUser = {
        id: Date.now(),
        name: formInput.fullName,
        email: formInput.email,
        password: formInput.password,
      };

      AsyncStorage.removeItem('user')
        .then(() => {
          AsyncStorage.setItem('user', JSON.stringify(newUser))
            .then(() => {
              alert('Account created successfully!');
              setFormInput({ fullName: '', email: '', password: '' });
              setError('');
              navigation.navigate('Login');
            })
            .catch((err) => {
              setError('Failed to create account. Please try again.');
              console.error('AsyncStorage setItem error:', err);
            });
        })
        .catch((err) => {
          console.error('AsyncStorage removeItem error:', err);
        });
    }
  };

  return (
    <ScreenWrapper>
      <View className="flex-1 justify-center px-6">
        {/* Header Section */}
        <View className="mb-12">
          <Text className="text-4xl font-bold text-gray-900">Create Account</Text>
          <Text className="mt-2 text-lg text-gray-500">Join us today</Text>
        </View>

        {/* Form Section */}
        <View className="gap-4">
          {/* Full Name Input */}
          <View>
            <Text className="mb-2 text-sm font-semibold text-gray-700">Full Name</Text>
            <TextInput
              placeholder="Enter your full name"
              onChangeText={(newText) => setFormInput({ ...formInput, fullName: newText })}
              value={formInput.fullName}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900"
              placeholderTextColor="#999"
            />
          </View>

          {/* Email Input */}
          <View>
            <Text className="mb-2 text-sm font-semibold text-gray-700">Email Address</Text>
            <TextInput
              placeholder="Enter your email"
              onChangeText={(newText) => setFormInput({ ...formInput, email: newText })}
              value={formInput.email}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password Input */}
          <View>
            <Text className="mb-2 text-sm font-semibold text-gray-700">Password</Text>
            <TextInput
              placeholder="Enter your password (min 6 characters)"
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

          {/* Sign Up Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            className="mt-6 flex-row items-center justify-center rounded-xl bg-blue-600 px-6 py-4"
            activeOpacity={0.8}>
            <Text className="text-base font-bold text-white">Create Account</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Section */}
        <View className="mt-8 flex-row items-center justify-center gap-1">
          <Text className="text-sm text-gray-600">Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
            <Text className="text-sm font-semibold text-blue-600">Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default SignUpScreen;
