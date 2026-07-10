import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from '@expo-google-fonts/inter';
import SplashScreen from './src/screens/SplashScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  const [currentScreen, setCurrentScreen] = useState('SPLASH');

  useEffect(() => {
    // Keep splash screen visible for exactly 3 seconds AND wait for fonts to load
    const timer = setTimeout(() => {
      if (fontsLoaded) {
        setCurrentScreen('WELCOME');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [fontsLoaded]);

  // If fonts aren't loaded yet, keep showing the splash screen
  if (!fontsLoaded) {
    return (
      <SafeAreaProvider>
        <SplashScreen />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      {currentScreen === 'SPLASH' && <SplashScreen />}
      {currentScreen === 'WELCOME' && (
        <WelcomeScreen onNavigate={(screen) => setCurrentScreen(screen)} />
      )}
      {currentScreen === 'LOGIN' && (
        <LoginScreen onNavigate={(screen) => setCurrentScreen(screen)} />
      )}
      {currentScreen === 'SIGNUP' && (
        <SignupScreen onNavigate={(screen) => setCurrentScreen(screen)} />
      )}
      {currentScreen === 'FORGOT_PASSWORD' && (
        <ForgotPasswordScreen onNavigate={(screen) => setCurrentScreen(screen)} />
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F6F0', // Solid Alabaster
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  pageTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: '#1E1E1E',
    letterSpacing: 4,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  pageSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#5A626A',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderWidth: 1.5,
    borderColor: '#1E1E1E',
    borderRadius: 6,
  },
  backButtonText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#1E1E1E',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
