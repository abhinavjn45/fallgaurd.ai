import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function SplashScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        {/* Brand Logomark */}
        <Text style={styles.logoText}>FALLGUARD</Text>
        
        {/* Minimalist Divider Line */}
        <View style={styles.divider} />
        
        {/* Reassuring, minimal Subtitle */}
        <Text style={styles.subtitleText}>AUTONOMOUS ELDER SAFETY</Text>
      </View>
    </SafeAreaView>
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
  },
  logoText: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 28,
    color: '#1E1E1E', // Deep Charcoal
    letterSpacing: 6,
    textAlign: 'center',
    marginBottom: 16,
  },
  divider: {
    width: 48,
    height: 1.5,
    backgroundColor: '#1E1E1E',
    marginBottom: 16,
  },
  subtitleText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#5A626A', // Quiet Slate Gray
    letterSpacing: 2.5,
    textAlign: 'center',
  },
});
