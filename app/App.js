import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from '@expo-google-fonts/inter';

// Screens & Layout
import SplashScreen from './src/screens/SplashScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';

import MainLayout from './src/components/MainLayout';
import DashboardScreen from './src/screens/DashboardScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import RemindersScreen from './src/screens/RemindersScreen';
import VitalsScreen from './src/screens/VitalsScreen';
import SupportScreen from './src/screens/SupportScreen';

// Global Context
import { AppProvider, useApp } from './src/context/AppContext';

function MainApp() {
  const { user, loginUser, logoutUser } = useApp();
  const [currentScreen, setCurrentScreen] = useState('SPLASH');

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

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

  // Unauthenticated routing flow
  if (!user) {
    return (
      <SafeAreaProvider>
        {currentScreen === 'SPLASH' && <SplashScreen />}
        {currentScreen === 'WELCOME' && (
          <WelcomeScreen onNavigate={setCurrentScreen} />
        )}
        {currentScreen === 'LOGIN' && (
          <LoginScreen 
            onNavigate={setCurrentScreen} 
            onLoginSuccess={() => {
              loginUser('arjun@fallguard.ai');
              setCurrentScreen('DASHBOARD');
            }} 
          />
        )}
        {currentScreen === 'SIGNUP' && (
          <SignupScreen 
            onNavigate={setCurrentScreen} 
            onSignupSuccess={() => {
              loginUser('arjun@fallguard.ai');
              setCurrentScreen('DASHBOARD');
            }} 
          />
        )}
        {currentScreen === 'FORGOT_PASSWORD' && (
          <ForgotPasswordScreen onNavigate={setCurrentScreen} />
        )}
      </SafeAreaProvider>
    );
  }

  // Authenticated routing flow (wrapped in MainLayout with Navbar, Bottom Bar, & Sidebar Drawer)
  const authenticatedScreens = ['DASHBOARD', 'HISTORY', 'REMINDERS', 'VITALS', 'SUPPORT'];
  const activeAuthScreen = authenticatedScreens.includes(currentScreen) ? currentScreen : 'DASHBOARD';

  return (
    <SafeAreaProvider>
      <MainLayout 
        currentScreen={activeAuthScreen}
        onNavigate={setCurrentScreen}
        onLogout={logoutUser}
      >
        {activeAuthScreen === 'DASHBOARD' && <DashboardScreen onNavigate={setCurrentScreen} />}
        {activeAuthScreen === 'HISTORY' && <HistoryScreen />}
        {activeAuthScreen === 'REMINDERS' && <RemindersScreen />}
        {activeAuthScreen === 'VITALS' && <VitalsScreen />}
        {activeAuthScreen === 'SUPPORT' && <SupportScreen />}
      </MainLayout>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
