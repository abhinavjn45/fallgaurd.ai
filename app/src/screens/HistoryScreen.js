import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  Pressable, 
  Modal, 
  TouchableWithoutFeedback 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export default function HistoryScreen() {
  const { historyList, acknowledgeAlarm, activePatientId } = useApp();
  const [filter, setFilter] = useState('ALL'); // 'ALL', 'ALERTS', 'CANCELLED'
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Formatting date for list
  const formatTime = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const filteredHistory = historyList.filter(evt => {
    if (evt.patientId !== activePatientId) return false;
    if (filter === 'ALL') return true;
    if (filter === 'ALERTS') return evt.eventType === 'CONFIRMED_FALL';
    if (filter === 'CANCELLED') return evt.eventType === 'CANCELLED';
    return true;
  });

  // Mock class probabilities for the 7 output classes based on the fall class
  const getClassProbabilities = (event) => {
    const baseProbs = {
      forward_fall: 0.01,
      backward_fall: 0.01,
      lateral_fall: 0.01,
      sitting_fast: 0.01,
      bending: 0.01,
      walking: 0.01,
      lying_down: 0.01
    };

    if (event.eventType === 'CONFIRMED_FALL') {
      baseProbs[event.fallClass || 'forward_fall'] = event.modelConfidence || 0.95;
      // Distribute the remaining percentage
      const remainder = (1 - baseProbs[event.fallClass || 'forward_fall']) / 6;
      Object.keys(baseProbs).forEach(k => {
        if (k !== event.fallClass) baseProbs[k] = remainder;
      });
    } else {
      // For cancelled/false alarms, sitting_fast or bending is high
      baseProbs[event.fallClass || 'sitting_fast'] = event.modelConfidence || 0.82;
      const remainder = (1 - baseProbs[event.fallClass || 'sitting_fast']) / 6;
      Object.keys(baseProbs).forEach(k => {
        if (k !== event.fallClass) baseProbs[k] = remainder;
      });
    }

    return Object.entries(baseProbs).map(([name, value]) => ({
      name: name.replace('_', ' ').toUpperCase(),
      value: Math.round(value * 100)
    })).sort((a, b) => b.value - a.value);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Incident Log</Text>
        <Text style={styles.subtitle}>Audit history of sensor detections, overrides, and alerts.</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterBar}>
        {['ALL', 'ALERTS', 'CANCELLED'].map((f) => (
          <Pressable
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* List */}
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {filteredHistory.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="list" size={24} color="#8E8E93" />
            <Text style={styles.emptyStateText}>No logged incidents found.</Text>
          </View>
        ) : (
          filteredHistory.map((evt) => {
            const isFall = evt.eventType === 'CONFIRMED_FALL';
            const isAck = evt.status === 'ACKNOWLEDGED';
            return (
              <Pressable 
                key={evt.id} 
                style={styles.eventCard}
                onPress={() => setSelectedEvent(evt)}
              >
                <View style={styles.cardInfo}>
                  <View style={[
                    styles.iconCircle,
                    isFall && !isAck && styles.iconCircleAlert,
                    !isFall && styles.iconCircleCancelled
                  ]}>
                    <Feather 
                      name={isFall ? "alert-triangle" : "slash"} 
                      size={14} 
                      color={isFall ? (isAck ? "#1E1E1E" : "#C93B3B") : "#8E8E93"} 
                    />
                  </View>
                  <View style={styles.textGroup}>
                    <Text style={styles.eventTitle}>
                      {isFall ? `Fall Detected (${evt.fallClass.replace('_', ' ')})` : 'Activity Suppressed'}
                    </Text>
                    <Text style={styles.eventTime}>{formatTime(evt.createdAt)}</Text>
                  </View>
                </View>

                <View style={[
                  styles.statusBadge,
                  isFall && !isAck && styles.statusBadgeAlert,
                  evt.status === 'CANCELLED' && styles.statusBadgeCancelled
                ]}>
                  <Text style={[
                    styles.statusBadgeText,
                    isFall && !isAck && styles.statusBadgeTextAlert,
                    evt.status === 'CANCELLED' && styles.statusBadgeTextCancelled
                  ]}>
                    {evt.status}
                  </Text>
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>

      {/* Details Modal */}
      <Modal
        visible={selectedEvent !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedEvent(null)}
      >
        <TouchableWithoutFeedback onPress={() => setSelectedEvent(null)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                {selectedEvent && (
                  <View style={{ width: '100%' }}>
                    {/* Header */}
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalHeaderTitle}>INCIDENT ANALYSIS</Text>
                      <Pressable onPress={() => setSelectedEvent(null)}>
                        <Feather name="x" size={20} color="#1E1E1E" />
                      </Pressable>
                    </View>

                    {/* Details block */}
                    <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                      <View style={styles.modalSection}>
                        <Text style={styles.sectionLabel}>Event Type</Text>
                        <Text style={styles.sectionValue}>
                          {selectedEvent.eventType === 'CONFIRMED_FALL' ? 'CONFIRMED ELDER FALL' : 'FALSE ALARM SUPPRESSION'}
                        </Text>
                      </View>

                      <View style={styles.modalSection}>
                        <Text style={styles.sectionLabel}>Timestamp</Text>
                        <Text style={styles.sectionValue}>{formatTime(selectedEvent.createdAt)}</Text>
                      </View>

                      {/* Stage 1 CNN Probabilities */}
                      <View style={styles.modalSection}>
                        <Text style={styles.sectionLabel}>Stage 1 - CNN Probabilities</Text>
                        <View style={styles.probsList}>
                          {getClassProbabilities(selectedEvent).map((prob) => (
                            <View key={prob.name} style={styles.probRow}>
                              <View style={styles.probTextRow}>
                                <Text style={styles.probName}>{prob.name}</Text>
                                <Text style={styles.probVal}>{prob.value}%</Text>
                              </View>
                              <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: `${prob.value}%` }]} />
                              </View>
                            </View>
                          ))}
                        </View>
                      </View>

                      {/* Stage 2 Fusion confirmation */}
                      <View style={styles.modalSection}>
                        <Text style={styles.sectionLabel}>Stage 2 - mmWave Fusion Status</Text>
                        <View style={styles.fusionCard}>
                          <Feather 
                            name={selectedEvent.mmwaveConfirmed ? "check-circle" : "x-circle"} 
                            size={16} 
                            color={selectedEvent.mmwaveConfirmed ? "#1E1E1E" : "#8E8E93"} 
                            style={styles.fusionIcon}
                          />
                          <View style={styles.fusionTextGroup}>
                            <Text style={styles.fusionTitle}>
                              {selectedEvent.mmwaveConfirmed ? 'Static Presence Confirmed' : 'No Static Presence'}
                            </Text>
                            <Text style={styles.fusionDetail}>
                              {selectedEvent.mmwaveConfirmed 
                                ? 'Radar registered a stationary body near the floor for > 1.5 seconds.' 
                                : 'Radar registered walking/active motion. System suppressed the alert.'
                              }
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Acknowledge Button in Modal */}
                      {selectedEvent.eventType === 'CONFIRMED_FALL' && selectedEvent.status === 'CONFIRMED' && (
                        <Pressable 
                          style={styles.ackButton}
                          onPress={() => {
                            acknowledgeAlarm(selectedEvent.id);
                            setSelectedEvent(null);
                          }}
                        >
                          <Text style={styles.ackButtonText}>Acknowledge Alert</Text>
                        </Pressable>
                      )}

                      {/* Audit Details */}
                      {selectedEvent.status === 'ACKNOWLEDGED' && (
                        <View style={styles.auditCard}>
                          <Text style={styles.auditText}>
                            ✓ Acknowledged by {selectedEvent.acknowledgedBy} at {new Date(selectedEvent.acknowledgedAt).toLocaleTimeString()}
                          </Text>
                        </View>
                      )}
                    </ScrollView>
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F6F0',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    marginBottom: 16,
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
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderColor: '#E6E2D8',
    marginBottom: 8,
  },
  filterTab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderColor: 'transparent',
  },
  filterTabActive: {
    borderColor: '#1E1E1E',
  },
  filterText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#8E8E93',
    letterSpacing: 0.5,
  },
  filterTextActive: {
    color: '#1E1E1E',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyStateText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#8E8E93',
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E6E2D8',
    borderRadius: 6,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
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
  iconCircleAlert: {
    borderColor: '#C93B3B',
    backgroundColor: 'rgba(201, 59, 59, 0.05)',
  },
  iconCircleCancelled: {
    borderColor: '#8E8E93',
  },
  textGroup: {
    gap: 2,
    flex: 1,
  },
  eventTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1E1E1E',
  },
  eventTime: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#5A626A',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#1E1E1E',
  },
  statusBadgeAlert: {
    borderColor: '#C93B3B',
    backgroundColor: 'rgba(201, 59, 59, 0.05)',
  },
  statusBadgeCancelled: {
    borderColor: '#8E8E93',
  },
  statusBadgeText: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 8,
    color: '#1E1E1E',
    letterSpacing: 0.5,
  },
  statusBadgeTextAlert: {
    color: '#C93B3B',
  },
  statusBadgeTextCancelled: {
    color: '#8E8E93',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(30, 30, 30, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#F9F6F0',
    borderWidth: 1.5,
    borderColor: '#D4CFC5',
    borderRadius: 8,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1.5,
    borderColor: '#E6E2D8',
  },
  modalHeaderTitle: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 13,
    color: '#1E1E1E',
    letterSpacing: 1,
  },
  modalScroll: {
    width: '100%',
  },
  modalSection: {
    marginBottom: 16,
    gap: 4,
  },
  sectionLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1E1E1E',
  },
  probsList: {
    gap: 8,
    marginTop: 4,
  },
  probRow: {
    gap: 4,
  },
  probTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  probName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#5A626A',
  },
  probVal: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#1E1E1E',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#E6E2D8',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#1E1E1E',
  },
  fusionCard: {
    flexDirection: 'row',
    padding: 12,
    borderWidth: 1,
    borderColor: '#D4CFC5',
    borderRadius: 4,
    gap: 12,
    alignItems: 'flex-start',
  },
  fusionIcon: {
    marginTop: 2,
  },
  fusionTextGroup: {
    flex: 1,
    gap: 2,
  },
  fusionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#1E1E1E',
  },
  fusionDetail: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#5A626A',
    lineHeight: 14,
  },
  ackButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    marginTop: 16,
    marginBottom: 8,
  },
  ackButtonText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#F9F6F0',
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  auditCard: {
    padding: 12,
    borderRadius: 4,
    backgroundColor: 'rgba(30, 30, 30, 0.03)',
    borderWidth: 1,
    borderColor: '#E6E2D8',
    marginTop: 8,
  },
  auditText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#1E1E1E',
  },
});
