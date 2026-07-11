import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  Pressable, 
  Dimensions, 
  Animated,
  Linking
} from 'react-native';
import { Feather, AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { Svg, Polyline, Line } from 'react-native-svg';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 48;
const CHART_HEIGHT = 100;
const BUFFER_SIZE = 40;

export default function DashboardScreen({ onNavigate }) {
  const {
    patients,
    activePatientId,
    setActivePatientId,
    activePatient,
    activeDeviceStatus,
    activeAlarm,
    simSignalMode,
    setSimSignalMode,
    simulateFall,
    simulateADL,
    cancelActiveAlarm,
    acknowledgeAlarm,
    toggleHeartbeat
  } = useApp();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Activity formatting and icon helpers
  const getActivityIcon = (location) => {
    const loc = location.toLowerCase();
    if (loc.includes('bedroom')) return 'bed-empty';
    if (loc.includes('living')) return 'sofa';
    if (loc.includes('kitchen')) return 'fridge-outline';
    if (loc.includes('terrace')) return 'weather-sunny';
    return 'map-marker-outline';
  };

  const formatActivityTime = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatActivityDate = (isoString) => {
    const d = new Date(isoString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return 'today';
    } else if (d.toDateString() === yesterday.toDateString()) {
      return 'yesterday';
    } else {
      const day = d.getDate();
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = monthNames[d.getMonth()];
      const year = d.getFullYear();
      return `${day} ${month}, ${year}`;
    }
  };

  // Collapsible Simulator Panel State
  const [isSimPanelExpanded, setIsSimPanelExpanded] = useState(true);

  // Live IMU stream buffers
  const [accelData, setAccelData] = useState(Array(BUFFER_SIZE).fill(0));
  const [gyroData, setGyroData] = useState(Array(BUFFER_SIZE).fill(0));

  // Pulse animation for alert screen
  const pulseAnim = useRef(new Animated.Value(0.1)).current;

  // Real-time chart tick
  useEffect(() => {
    let tickCount = 0;
    let spikeTick = 0;

    const interval = setInterval(() => {
      setAccelData((prevAccel) => {
        setGyroData((prevGyro) => {
          let nextAccel = 0;
          let nextGyro = 0;

          if (simSignalMode === 'WALKING') {
            tickCount++;
            // Rhythmic walk waves (sine waves + noise)
            nextAccel = Math.sin(tickCount * 0.4) * 1.8 + (Math.random() - 0.5) * 0.4;
            nextGyro = Math.cos(tickCount * 0.3) * 1.2 + (Math.random() - 0.5) * 0.3;
          } else if (simSignalMode === 'SPIKE') {
            spikeTick++;
            if (spikeTick <= 2) {
              // Initial impact spike
              nextAccel = 8.5;
              nextGyro = -5.0;
            } else if (spikeTick <= 4) {
              // Rebound crash
              nextAccel = -7.0;
              nextGyro = 6.2;
            } else {
              // Post-fall stillness
              nextAccel = (Math.random() - 0.5) * 0.1;
              nextGyro = (Math.random() - 0.5) * 0.08;
              // Transition signal mode to STILL
              setSimSignalMode('STILL');
              spikeTick = 0;
            }
          } else if (simSignalMode === 'SIT_DOWN_SPIKE') {
            spikeTick++;
            if (spikeTick <= 2) {
              // Medium spike (sitting down fast)
              nextAccel = 4.2;
              nextGyro = -2.1;
            } else if (spikeTick <= 4) {
              // Rebound stability
              nextAccel = -2.0;
              nextGyro = 1.0;
            } else {
              // Return to walking
              setSimSignalMode('WALKING');
              spikeTick = 0;
            }
          } else if (simSignalMode === 'STILL') {
            // Stillness / lying down
            nextAccel = (Math.random() - 0.5) * 0.08;
            nextGyro = (Math.random() - 0.5) * 0.06;
          }

          const nextAccelList = [...prevAccel.slice(1), nextAccel];
          const nextGyroList = [...prevGyro.slice(1), nextGyro];
          return nextGyroList;
        });

        // Trigger update for Accel array in synchronization
        let nextAccelVal = 0;
        if (simSignalMode === 'WALKING') {
          nextAccelVal = Math.sin(tickCount * 0.4) * 1.8 + (Math.random() - 0.5) * 0.4;
        } else if (simSignalMode === 'SPIKE') {
          spikeTick++;
          if (spikeTick <= 2) nextAccelVal = 8.5;
          else if (spikeTick <= 4) nextAccelVal = -7.0;
          else nextAccelVal = (Math.random() - 0.5) * 0.1;
        } else if (simSignalMode === 'SIT_DOWN_SPIKE') {
          spikeTick++;
          if (spikeTick <= 2) nextAccelVal = 4.2;
          else if (spikeTick <= 4) nextAccelVal = -2.0;
          else nextAccelVal = Math.sin(tickCount * 0.4) * 1.8 + (Math.random() - 0.5) * 0.4;
        } else if (simSignalMode === 'STILL') {
          nextAccelVal = (Math.random() - 0.5) * 0.08;
        }
        return [...prevAccel.slice(1), nextAccelVal];
      });
    }, 60);

    return () => clearInterval(interval);
  }, [simSignalMode]);

  // Pulse animation for critical alarms
  useEffect(() => {
    if (activeAlarm && activeAlarm.status === 'CONFIRMED') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.6,
            duration: 800,
            useNativeDriver: true
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.1,
            duration: 800,
            useNativeDriver: true
          })
        ])
      ).start();
    } else {
      pulseAnim.setValue(0.1);
    }
  }, [activeAlarm]);

  // Generate SVG points string for visualizers
  const getPointsString = (data) => {
    return data.map((val, idx) => {
      const x = (idx / (BUFFER_SIZE - 1)) * CHART_WIDTH;
      // Map range -10 to 10 onto graph height 0 to CHART_HEIGHT
      const y = CHART_HEIGHT / 2 - (val / 10) * (CHART_HEIGHT / 2);
      return `${x},${y}`;
    }).join(' ');
  };

  const isOffline = activeDeviceStatus === 'OFFLINE';
  const isPending = activeAlarm && activeAlarm.status === 'PENDING';
  const isConfirmed = activeAlarm && activeAlarm.status === 'CONFIRMED';

  // WiFi signal strength and status getters
  const getWifiIcon = () => {
    if (isOffline) return 'wifi-strength-off';
    if (activePatientId === 'p-1') return 'wifi-strength-4';
    return 'wifi-strength-2';
  };

  const getStatusText = () => {
    if (isOffline) return 'OFFLINE';
    if (activePatientId === 'p-1') return 'ACTIVE · EXCELLENT';
    return 'ACTIVE · FAIR';
  };

  return (
    <View style={styles.outerContainer}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Device Connectivity Banner with Dropdown Selection */}
        <View style={styles.bannerContainer}>
          <Pressable 
            style={styles.deviceStatusBanner} 
            onPress={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <View style={styles.deviceHeaderInfo}>
              <Feather 
                name="cpu" 
                size={14} 
                color={isOffline ? '#8E8E93' : '#1E1E1E'} 
                style={styles.deviceIcon} 
              />
              <Text style={styles.deviceName}>
                {activePatient ? activePatient.name : 'Select Patient'}
              </Text>
              <Feather 
                name={isDropdownOpen ? "chevron-up" : "chevron-down"} 
                size={14} 
                color={isOffline ? "#8E8E93" : "#1E1E1E"} 
                style={styles.chevronIcon} 
              />
            </View>
            <View style={styles.heartbeatRow}>
              <MaterialCommunityIcons 
                name={getWifiIcon()} 
                size={16} 
                color={isOffline ? '#8E8E93' : '#1E1E1E'} 
              />
              <Text style={[styles.heartbeatText, isOffline && styles.heartbeatTextOffline]}>
                {getStatusText()}
              </Text>
            </View>
          </Pressable>

          {isDropdownOpen && (
            <View style={styles.dropdownMenu}>
              {patients.map((pat) => {
                const isSelected = pat.id === activePatientId;
                return (
                  <Pressable 
                    key={pat.id} 
                    style={[styles.dropdownItem, isSelected && styles.dropdownItemActive]}
                    onPress={() => {
                      setActivePatientId(pat.id);
                      setIsDropdownOpen(false);
                    }}
                  >
                    <View style={styles.dropdownItemLeft}>
                      <Feather name="user" size={14} color={isSelected ? '#1E1E1E' : '#5A626A'} />
                      <View style={styles.dropdownItemTextGroup}>
                        <Text style={[styles.dropdownItemName, isSelected && styles.dropdownItemNameActive]}>
                          {pat.name}
                        </Text>
                        <Text style={styles.dropdownItemSub}>
                          {pat.deviceName}
                        </Text>
                      </View>
                    </View>
                    {isSelected && <Feather name="check" size={14} color="#1E1E1E" />}
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* Safety Status Block */}
        {isConfirmed ? (
          <View style={[styles.statusCard, styles.statusCardCritical]}>
            <Animated.View style={[styles.pulseOverlay, { opacity: pulseAnim }]} />
            <View style={styles.alertHeaderRow}>
              <Feather name="alert-triangle" size={24} color="#F9F6F0" />
              <Text style={styles.statusTitleCritical}>FALL DETECTED!</Text>
            </View>
            <Text style={styles.statusDescriptionCritical}>
              The device classified a {activeAlarm.fallClass.replace('_', ' ')} and the mmWave sensor confirmed a static body near the floor. Urgent response is required.
            </Text>
            <Pressable 
              style={styles.actionButtonCritical}
              onPress={() => acknowledgeAlarm(activeAlarm.id)}
            >
              <Text style={styles.actionButtonTextCritical}>Acknowledge & Handle</Text>
            </Pressable>
          </View>
        ) : isPending ? (
          <View style={[styles.statusCard, styles.statusCardPending]}>
            <View style={styles.alertHeaderRow}>
              <Feather name="clock" size={20} color="#1E1E1E" style={styles.pendingIconSpin} />
              <Text style={styles.statusTitlePending}>PENDING CONFIRMATION</Text>
            </View>
            <Text style={styles.statusDescriptionPending}>
              Impact spike detected. Awaiting check-in response from Kamala. Alerting caregiver in {activeAlarm.countdown} seconds.
            </Text>
            
            {/* Minimalist Countdown progress bar */}
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: `${(activeAlarm.countdown / 30) * 100}%` }]} />
            </View>
          </View>
        ) : isOffline ? (
          <View style={[styles.statusCard, styles.statusCardOffline]}>
            <Feather name="alert-circle" size={24} color="#8E8E93" style={styles.statusCardIcon} />
            <Text style={styles.statusTitleOffline}>MONITORING SUSPENDED</Text>
            <Text style={styles.statusDescriptionOffline}>
              The hub is offline. Check WiFi configuration or device power supply immediately to resume fall safety tracking.
            </Text>
          </View>
        ) : (
          <View style={styles.statusCard}>
            <Feather name="check-circle" size={24} color="#1E1E1E" style={styles.statusCardIcon} />
            <Text style={styles.statusTitle}>ALL CLEAR</Text>
            <Text style={styles.statusDescription}>
              Normal activity patterns. No fall impacts or anomaly metrics detected. Elder safety tracking fully active.
            </Text>
          </View>
        )}

        {/* Patient Details Card */}
        {activePatient && (
          <View style={styles.patientCard}>
            {/* Header info: Avatar & Name/Age */}
            <View style={styles.patientHeaderRow}>
              <View style={styles.patientAvatar}>
                <Text style={styles.patientAvatarText}>{activePatient.avatarText}</Text>
              </View>
              <View style={styles.patientNameContainer}>
                <Text style={styles.patientName}>{activePatient.name}</Text>
                <Text style={styles.patientAge}>Age: {activePatient.age}</Text>
              </View>
            </View>

            {/* Separator line */}
            <View style={styles.patientDivider} />

            {/* Location row */}
            <View style={styles.patientDetailRow}>
              <View style={styles.detailRowLeft}>
                <Feather name="map-pin" size={14} color="#1E1E1E" style={styles.detailIcon} />
                <Text style={styles.detailText}>{activePatient.location}</Text>
              </View>
              <Text style={styles.detailText}>since {activePatient.locationTime}</Text>
            </View>

            {/* Temp row */}
            <View style={styles.patientDetailRow}>
              <View style={styles.detailRowLeft}>
                <Feather name="thermometer" size={14} color="#1E1E1E" style={styles.detailIcon} />
                <Text style={styles.detailText}>Room Temp.</Text>
              </View>
              <Text style={styles.detailText}>{activePatient.temp}</Text>
            </View>

            {/* Call button */}
            <Pressable 
              style={styles.callPatientButton}
              onPress={() => {
                Linking.openURL(`tel:${activePatient.phoneNumber}`).catch(err => console.log('Error dialing', err));
              }}
            >
              <Feather name="phone" size={14} color="#1E1E1E" style={styles.callIcon} />
              <Text style={styles.callPatientButtonText}>Call {activePatient.name.split(' ')[0]}</Text>
            </Pressable>
          </View>
        )}

        {/* Recent Activities Section */}
        {activePatient && activePatient.recentActivities && (
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.activitiesHeader}>
              <Text style={styles.cardLabel}>RECENT ACTIVITIES</Text>
              <Pressable onPress={() => onNavigate('HISTORY')}>
                <Text style={styles.viewAllLink}>View All</Text>
              </Pressable>
            </View>

            {/* Activities List */}
            <View style={styles.activitiesList}>
              {activePatient.recentActivities.map((act) => (
                <View key={act.id} style={styles.activityItem}>
                  {/* Left Side: Location Icon & Title/Action */}
                  <View style={styles.activityLeft}>
                    <View style={styles.activityIconCircle}>
                      <MaterialCommunityIcons 
                        name={getActivityIcon(act.location)} 
                        size={16} 
                        color="#1E1E1E" 
                      />
                    </View>
                    <View style={styles.activityTextGroup}>
                      <Text style={styles.activityTitle}>{act.title}</Text>
                      <Text style={styles.activityAction}>{act.action}</Text>
                    </View>
                  </View>

                  {/* Right Side: Time & Date */}
                  <View style={styles.activityRight}>
                    <Text style={styles.activityTime}>{formatActivityTime(act.timestamp)}</Text>
                    <Text style={styles.activityDate}>{formatActivityDate(act.timestamp)}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Real-time IMU visualizer graph */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>STAGE 1: 6-AXIS MOTION INDEX (IMU)</Text>
            <View style={styles.signalModeBadge}>
              <Text style={styles.signalModeText}>{simSignalMode}</Text>
            </View>
          </View>
          
          {/* Chart Wrapper */}
          <View style={styles.chartWrapper}>
            <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
              {/* Zero line */}
              <Line 
                x1="0" 
                y1={CHART_HEIGHT / 2} 
                x2={CHART_WIDTH} 
                y2={CHART_HEIGHT / 2} 
                stroke="#E6E2D8" 
                strokeWidth="1.5" 
                strokeDasharray="4"
              />
              {/* Acceleration data line */}
              <Polyline
                points={getPointsString(accelData)}
                fill="none"
                stroke="#1E1E1E"
                strokeWidth="1.8"
              />
              {/* Gyroscope data line */}
              <Polyline
                points={getPointsString(gyroData)}
                fill="none"
                stroke="#8E8E93"
                strokeWidth="1.2"
              />
            </Svg>
          </View>
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#1E1E1E' }]} />
              <Text style={styles.legendText}>Accelerometer (g)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#8E8E93' }]} />
              <Text style={styles.legendText}>Gyroscope (dps)</Text>
            </View>
          </View>
        </View>

        {/* mmWave Presence Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>STAGE 2: RADAR CONFIRMATION (mmWAVE)</Text>
          <View style={styles.radarCardContent}>
            <Feather 
              name={simSignalMode === 'STILL' ? "target" : "activity"} 
              size={24} 
              color="#1E1E1E" 
              style={styles.radarIcon} 
            />
            <View style={styles.radarTextGroup}>
              <Text style={styles.radarStatusTitle}>
                {isOffline 
                  ? 'Sensor disconnected' 
                  : simSignalMode === 'STILL' 
                    ? 'Body Motionless Near Floor' 
                    : 'Target Movement Active'
                }
              </Text>
              <Text style={styles.radarStatusDescription}>
                {isOffline 
                  ? 'mmWave radar offline.' 
                  : simSignalMode === 'STILL' 
                    ? 'Static presence registered at 0.4m height gates (Stage 2 triggered).' 
                    : 'Dynamic activity and chest micro-displacements indicate walking or bending.'
                }
              </Text>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* Collapsible Simulation Controller - Anchored at the bottom */}
      <View style={styles.simPanel}>
        <Pressable 
          style={styles.simPanelHeader}
          onPress={() => setIsSimPanelExpanded(!isSimPanelExpanded)}
        >
          <View style={styles.simHeaderInfo}>
            <Feather name="settings" size={14} color="#1E1E1E" style={styles.simSettingsIcon} />
            <Text style={styles.simPanelTitle}>DEVELOPER SIMULATOR HUB</Text>
          </View>
          <Feather 
            name={isSimPanelExpanded ? "chevron-down" : "chevron-up"} 
            size={16} 
            color="#1E1E1E" 
          />
        </Pressable>

        {isSimPanelExpanded && (
          <View style={styles.simPanelContent}>
            <View style={styles.simButtonRow}>
              <Pressable 
                style={[styles.simBtn, isOffline && styles.simBtnDisabled]} 
                onPress={() => simulateFall('forward_fall')}
                disabled={isOffline || isPending || isConfirmed}
              >
                <Text style={styles.simBtnText}>Simulate Fall</Text>
              </Pressable>

              <Pressable 
                style={[styles.simBtn, isOffline && styles.simBtnDisabled]} 
                onPress={simulateADL}
                disabled={isOffline || isPending || isConfirmed}
              >
                <Text style={styles.simBtnText}>Simulate Sit down</Text>
              </Pressable>
            </View>

            <View style={styles.simButtonRow}>
              <Pressable 
                style={styles.simBtnOutline} 
                onPress={toggleHeartbeat}
              >
                <Text style={styles.simBtnOutlineText}>
                  {isOffline ? 'Connect Hub' : 'Disconnect Hub'}
                </Text>
              </Pressable>

              {/* Physical Button simulation - only visible when a check-in is pending */}
              {isPending && (
                <Pressable 
                  style={[styles.simBtn, styles.simBtnCritical]} 
                  onPress={cancelActiveAlarm}
                >
                  <Text style={styles.simBtnText}>Kamala's Push Button (Cancel)</Text>
                </Pressable>
              )}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#F9F6F0',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 200, // Large bottom padding to prevent coverage by the simulator hub
    gap: 16,
  },
  bannerContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  deviceStatusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: '#E6E2D8',
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  chevronIcon: {
    marginLeft: 6,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: '#F9F6F0',
    borderWidth: 1.5,
    borderColor: '#D4CFC5',
    borderRadius: 6,
    padding: 4,
    zIndex: 10000,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  dropdownItemActive: {
    backgroundColor: 'rgba(30, 30, 30, 0.05)',
  },
  dropdownItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dropdownItemTextGroup: {
    gap: 2,
  },
  dropdownItemName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#5A626A',
  },
  dropdownItemNameActive: {
    color: '#1E1E1E',
  },
  dropdownItemSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#8E8E93',
  },
  deviceHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceIcon: {
    marginRight: 6,
  },
  deviceName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#1E1E1E',
  },
  heartbeatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heartbeatDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#5A626A', // Quiet slate grey instead of flashy green
  },
  heartbeatDotOffline: {
    backgroundColor: '#8E8E93',
  },
  heartbeatText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#5A626A',
    letterSpacing: 0.5,
  },
  heartbeatTextOffline: {
    color: '#8E8E93',
  },
  statusCard: {
    borderWidth: 1.5,
    borderColor: '#E6E2D8',
    borderRadius: 6,
    padding: 16,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  statusCardIcon: {
    marginBottom: 4,
  },
  statusTitle: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 18,
    color: '#1E1E1E',
    letterSpacing: 1,
  },
  statusDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#5A626A',
    textAlign: 'center',
    lineHeight: 18,
  },
  statusCardOffline: {
    borderColor: '#D4CFC5',
    opacity: 0.8,
  },
  statusTitleOffline: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 18,
    color: '#8E8E93',
    letterSpacing: 1,
  },
  statusDescriptionOffline: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 18,
  },
  statusCardPending: {
    borderColor: '#1E1E1E',
    borderWidth: 2,
    backgroundColor: 'transparent',
    gap: 12,
  },
  statusTitlePending: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 18,
    color: '#1E1E1E',
    letterSpacing: 1,
  },
  statusDescriptionPending: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#1E1E1E',
    textAlign: 'center',
    lineHeight: 18,
  },
  progressContainer: {
    width: '100%',
    height: 6,
    backgroundColor: '#E6E2D8',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#1E1E1E',
  },
  statusCardCritical: {
    backgroundColor: '#C93B3B', // Solid Crimson Red
    borderColor: '#C93B3B',
    paddingVertical: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  pulseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F9F6F0',
  },
  alertHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusTitleCritical: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 20,
    color: '#F9F6F0',
    letterSpacing: 1,
  },
  statusDescriptionCritical: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#F9F6F0',
    textAlign: 'center',
    lineHeight: 18,
  },
  actionButtonCritical: {
    width: '100%',
    height: 48,
    backgroundColor: '#F9F6F0',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  actionButtonTextCritical: {
    fontFamily: 'Inter_700Bold',
    color: '#C93B3B',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    borderWidth: 1.5,
    borderColor: '#E6E2D8',
    borderRadius: 6,
    padding: 16,
    backgroundColor: 'transparent',
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: '#1E1E1E',
    letterSpacing: 1,
  },
  signalModeBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E6E2D8',
  },
  signalModeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 8,
    color: '#5A626A',
  },
  chartWrapper: {
    borderWidth: 1,
    borderColor: '#E6E2D8',
    borderRadius: 4,
    padding: 8,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#5A626A',
  },
  radarCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  radarIcon: {
    marginTop: 2,
  },
  radarTextGroup: {
    flex: 1,
    gap: 2,
  },
  radarStatusTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1E1E1E',
  },
  radarStatusDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#5A626A',
    lineHeight: 16,
  },
  simPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F9F6F0',
    borderTopWidth: 1.5,
    borderColor: '#D4CFC5',
  },
  simPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E2D8',
  },
  simHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  simSettingsIcon: {
    marginRight: 8,
  },
  simPanelTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: '#1E1E1E',
    letterSpacing: 1,
  },
  simPanelContent: {
    padding: 16,
    gap: 12,
  },
  simButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  simBtn: {
    flex: 1,
    height: 44,
    backgroundColor: '#1E1E1E',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  simBtnDisabled: {
    opacity: 0.5,
  },
  simBtnCritical: {
    backgroundColor: '#C93B3B',
    flex: 1.5,
  },
  simBtnText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#F9F6F0',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  simBtnOutline: {
    flex: 1,
    height: 44,
    borderWidth: 1.5,
    borderColor: '#1E1E1E',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  simBtnOutlineText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#1E1E1E',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  patientCard: {
    borderWidth: 1.5,
    borderColor: '#E6E2D8',
    borderRadius: 6,
    padding: 16,
    backgroundColor: 'transparent',
    gap: 12,
  },
  patientHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  patientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  patientAvatarText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#F9F6F0',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  patientNameContainer: {
    gap: 2,
  },
  patientName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#1E1E1E',
  },
  patientAge: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#5A626A',
  },
  patientDivider: {
    height: 1.5,
    backgroundColor: '#E6E2D8',
    marginVertical: 4,
  },
  patientDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailIcon: {
    width: 14,
  },
  detailText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#1E1E1E',
  },
  detailTimeAgo: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#8E8E93',
  },
  callPatientButton: {
    flexDirection: 'row',
    height: 44,
    borderWidth: 1.5,
    borderColor: '#1E1E1E',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginTop: 8,
    gap: 8,
  },
  callIcon: {
    marginRight: 0,
  },
  callPatientButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1E1E1E',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activitiesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllLink: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#1E1E1E',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activitiesList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  activityIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D4CFC5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityTextGroup: {
    gap: 2,
    flex: 1,
  },
  activityTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1E1E1E',
  },
  activityAction: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#5A626A',
  },
  activityRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  activityTime: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#1E1E1E',
  },
  activityDate: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#8E8E93',
  },
  pendingIconSpin: {
    // Standard spinner styling if animated
  }
});
