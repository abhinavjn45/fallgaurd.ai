import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export default function VitalsScreen() {
  const { activePatientId, activePatient } = useApp();

  const name = activePatient ? activePatient.name.split(' ')[0] : 'Patient';

  const kamalaVitals = [
    {
      id: 'v-1',
      title: 'Respiration Rate',
      value: '16 bpm',
      status: 'NORMAL',
      detail: `Measured continuously via micro-radar chest displacement.`,
      icon: 'wind',
      lastUpdate: 'Just now'
    },
    {
      id: 'v-2',
      title: 'Presence State',
      value: 'Static In-Room',
      status: 'NORMAL',
      detail: `mmWave confirms ${name} is present and stable inside detection gates.`,
      icon: 'user',
      lastUpdate: '2s ago'
    },
    {
      id: 'v-3',
      title: 'Activity Index',
      value: 'Resting / Still',
      status: 'STABLE',
      detail: 'Last active walking movement detected 12 minutes ago.',
      icon: 'activity',
      lastUpdate: '12m ago'
    }
  ];

  const ramVitals = [
    {
      id: 'v-1',
      title: 'Respiration Rate',
      value: '18 bpm',
      status: 'NORMAL',
      detail: 'Measured continuously via micro-radar chest displacement.',
      icon: 'wind',
      lastUpdate: 'Just now'
    },
    {
      id: 'v-2',
      title: 'Presence State',
      value: 'Active In-Room',
      status: 'NORMAL',
      detail: `mmWave confirms ${name} is present and stable inside detection gates.`,
      icon: 'user',
      lastUpdate: '1s ago'
    },
    {
      id: 'v-3',
      title: 'Activity Index',
      value: 'Walking / Moving',
      status: 'ACTIVE',
      detail: 'Active walking movement detected inside target zone.',
      icon: 'activity',
      lastUpdate: '1s ago'
    }
  ];

  const vitals = activePatientId === 'p-1' ? kamalaVitals : ramVitals;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Elder Presence & Vitals</Text>
        <Text style={styles.subtitle}>
          Real-time activity indexes derived from the room-mounted mmWave radar sensor.
        </Text>
      </View>

      <View style={styles.vitalsSection}>
        {vitals.map((vital) => (
          <View key={vital.id} style={styles.vitalCard}>
            <View style={styles.cardHeader}>
              <View style={styles.titleRow}>
                <Feather name={vital.icon} size={16} color="#1E1E1E" style={styles.cardIcon} />
                <Text style={styles.cardTitle}>{vital.title}</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{vital.status}</Text>
              </View>
            </View>

            <Text style={styles.vitalValue}>{vital.value}</Text>
            <Text style={styles.vitalDetail}>{vital.detail}</Text>
            
            <View style={styles.cardDivider} />
            <Text style={styles.lastUpdate}>Last update: {vital.lastUpdate}</Text>
          </View>
        ))}
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
  },
  header: {
    marginBottom: 24,
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
  vitalsSection: {
    gap: 16,
  },
  vitalCard: {
    borderWidth: 1.5,
    borderColor: '#E6E2D8',
    borderRadius: 6,
    padding: 16,
    backgroundColor: 'transparent',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    marginRight: 8,
  },
  cardTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1E1E1E',
  },
  badge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#1E1E1E',
  },
  badgeText: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 8,
    color: '#1E1E1E',
    letterSpacing: 0.5,
  },
  vitalValue: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 28,
    color: '#1E1E1E',
    marginBottom: 6,
  },
  vitalDetail: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#5A626A',
    lineHeight: 16,
    marginBottom: 12,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#E6E2D8',
    marginBottom: 10,
  },
  lastUpdate: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#8E8E93',
  },
});
