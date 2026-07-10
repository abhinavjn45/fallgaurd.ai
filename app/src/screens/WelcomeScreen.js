import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';

export default function WelcomeScreen({ onNavigate }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Brand Section */}
      <View style={styles.brandContainer}>
        {/* Minimal Shield/Safety Icon */}
        <View style={styles.logoContainer}>
          <Feather name="shield" size={40} color="#1E1E1E" />
        </View>
        
        <Text style={styles.title}>FALLGUARD</Text>
        <Text style={styles.subtitle}>Continuous Elder Safety & Fall Detection</Text>
        <Text style={styles.version}>Version 1.0.0</Text>
      </View>

      {/* Actions Section */}
      <View style={styles.actionsContainer}>
        {/* Login Button (Solid) */}
        <Pressable 
          style={({ pressed }) => [
            styles.buttonSolid,
            pressed && styles.buttonPressed
          ]}
          onPress={() => onNavigate('LOGIN')}
        >
          <Text style={styles.buttonSolidText}>Login</Text>
        </Pressable>

        {/* Sign Up Button (Outlined) */}
        <Pressable 
          style={({ pressed }) => [
            styles.buttonOutline,
            pressed && styles.buttonPressed
          ]}
          onPress={() => onNavigate('SIGNUP')}
        >
          <Text style={styles.buttonOutlineText}>Sign Up</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F6F0', // Solid Alabaster Background
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  brandContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  logoContainer: {
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 32,
    color: '#1E1E1E', // Deep Charcoal
    letterSpacing: 6,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#5A626A', // Slate Gray
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: 12,
  },
  version: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#8E8E93',
    letterSpacing: 1,
  },
  actionsContainer: {
    width: '100%',
    marginBottom: 48,
    gap: 16,
  },
  buttonSolid: {
    width: '100%',
    height: 52,
    backgroundColor: '#1E1E1E', // Solid Charcoal
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6, // Sharp minimal curve
  },
  buttonSolidText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#F9F6F0', // Alabaster text
    fontSize: 15,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  buttonOutline: {
    width: '100%',
    height: 52,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  buttonOutlineText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#1E1E1E',
    fontSize: 15,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  buttonPressed: {
    opacity: 0.85,
  },
});
