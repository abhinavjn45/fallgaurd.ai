import React from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export default function SupportScreen() {
  const { logoutUser } = useApp();

  const handleCall = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`).catch(err => console.log('Error opening dialer', err));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Caregiver Support</Text>
        <Text style={styles.subtitle}>
          Troubleshooting guidelines, hardware status, and emergency family contacts.
        </Text>
      </View>

      {/* Emergency Contacts Card */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Emergency Contacts</Text>
        <View style={styles.contactsList}>
          <View style={styles.contactRow}>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>Dr. Sharma (Geriatrician)</Text>
              <Text style={styles.contactPhone}>+91 98765 43210</Text>
            </View>
            <Pressable 
              style={styles.callButton}
              onPress={() => handleCall('+919876543210')}
            >
              <Feather name="phone" size={14} color="#F9F6F0" />
            </Pressable>
          </View>
          
          <View style={styles.contactRow}>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>City Health Hospital</Text>
              <Text style={styles.contactPhone}>+91 120 456 7890</Text>
            </View>
            <Pressable 
              style={styles.callButton}
              onPress={() => handleCall('+911204567890')}
            >
              <Feather name="phone" size={14} color="#F9F6F0" />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Hardware Guide Section */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Hardware Guide</Text>
        <View style={styles.guideItem}>
          <Text style={styles.guideTitle}>No Heartbeat Ping?</Text>
          <Text style={styles.guideText}>
            Ensure the ESP32-S3 board has solid blue LEDs lit. If blinking yellow, the device is searching for WiFi. Confirm your home router is active.
          </Text>
        </View>

        <View style={styles.guideItem}>
          <Text style={styles.guideTitle}>Calibrating mmWave gates</Text>
          <Text style={styles.guideText}>
            The HLK-LD2410B sensor works best when mounted on the wall at a height of 1.5 - 2.0 meters, tilted slightly downwards toward the center of the room.
          </Text>
        </View>
      </View>

      {/* Account Info Section */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Caregiver Credentials</Text>
        <View style={styles.accountRow}>
          <View style={styles.accountDetail}>
            <Text style={styles.accountLabel}>ROLE</Text>
            <Text style={styles.accountValue}>Primary Guardian</Text>
          </View>
          <View style={styles.accountDetail}>
            <Text style={styles.accountLabel}>REGION</Text>
            <Text style={styles.accountValue}>India (NTP synced)</Text>
          </View>
        </View>
        
        <Pressable style={styles.logoutButton} onPress={logoutUser}>
          <Feather name="log-out" size={16} color="#C93B3B" style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Sign Out from Hub</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F6F0',
  },
  content: {
    padding: 24,
    gap: 16,
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 22,
    color: '#1E1E1E',
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#5A626A',
    lineHeight: 18,
  },
  sectionCard: {
    borderWidth: 1.5,
    borderColor: '#E6E2D8',
    borderRadius: 6,
    padding: 16,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#1E1E1E',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  contactsList: {
    gap: 12,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E2D8',
  },
  contactInfo: {
    gap: 2,
  },
  contactName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1E1E1E',
  },
  contactPhone: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#5A626A',
  },
  callButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideItem: {
    marginBottom: 16,
    gap: 4,
  },
  guideTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1E1E1E',
  },
  guideText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#5A626A',
    lineHeight: 16,
  },
  accountRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  accountDetail: {
    flex: 1,
    gap: 2,
  },
  accountLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    color: '#8E8E93',
    letterSpacing: 0.5,
  },
  accountValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1E1E1E',
  },
  logoutButton: {
    flexDirection: 'row',
    height: 48,
    borderWidth: 1.5,
    borderColor: '#C93B3B',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#C93B3B',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
