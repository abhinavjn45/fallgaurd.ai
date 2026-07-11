import React from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export default function RemindersScreen() {
  const { activePatientId, activePatient } = useApp();

  const kamalaReminders = [
    { id: '1', title: 'Morning Pills (BP)', time: '08:30 AM', days: 'Daily', active: true },
    { id: '2', title: 'Afternoon Hydration Check', time: '02:00 PM', days: 'Daily', active: true },
    { id: '3', title: 'Physiotherapy Walk', time: '05:30 PM', days: 'Mon, Wed, Fri', active: true },
    { id: '4', title: 'Night Bedtime Status Check', time: '10:00 PM', days: 'Daily', active: false },
  ];

  const ramReminders = [
    { id: '1', title: 'Heart Medication', time: '09:00 AM', days: 'Daily', active: true },
    { id: '2', title: 'Evening Sugar Level Check', time: '06:00 PM', days: 'Daily', active: true },
  ];

  const reminders = activePatientId === 'p-1' ? kamalaReminders : ramReminders;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Safety & Care Reminders</Text>
        <Text style={styles.subtitle}>Medication schedules and caregiver alerts for {activePatient ? activePatient.name : 'Patient'}.</Text>
      </View>

      <View style={styles.listSection}>
        {reminders.map((reminder) => (
          <View 
            key={reminder.id} 
            style={[styles.reminderCard, !reminder.active && styles.reminderCardInactive]}
          >
            <View style={styles.reminderInfo}>
              <View style={styles.iconCircle}>
                <Feather 
                  name={reminder.active ? "clock" : "bell-off"} 
                  size={16} 
                  color={reminder.active ? "#1E1E1E" : "#8E8E93"} 
                />
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.reminderTitle, !reminder.active && styles.textMuted]}>
                  {reminder.title}
                </Text>
                <Text style={styles.reminderDetails}>
                  {reminder.days} · {reminder.time}
                </Text>
              </View>
            </View>

            <View style={styles.statusBadge}>
              <Text style={[styles.statusText, reminder.active ? styles.statusActive : styles.statusInactive]}>
                {reminder.active ? 'ACTIVE' : 'MUTED'}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Add New Button */}
      <Pressable style={styles.addButton}>
        <Feather name="plus" size={16} color="#1E1E1E" style={styles.addIcon} />
        <Text style={styles.addButtonText}>Create New Reminder</Text>
      </Pressable>
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
  listSection: {
    gap: 12,
    marginBottom: 24,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E6E2D8',
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  reminderCardInactive: {
    opacity: 0.6,
  },
  reminderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D4CFC5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    gap: 2,
  },
  reminderTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1E1E1E',
  },
  textMuted: {
    color: '#8E8E93',
  },
  reminderDetails: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#5A626A',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#D4CFC5',
  },
  statusText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 8,
    letterSpacing: 0.5,
  },
  statusActive: {
    color: '#1E1E1E',
  },
  statusInactive: {
    color: '#8E8E93',
  },
  addButton: {
    flexDirection: 'row',
    height: 48,
    borderWidth: 1.5,
    borderColor: '#1E1E1E',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  addIcon: {
    marginRight: 8,
  },
  addButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1E1E1E',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
