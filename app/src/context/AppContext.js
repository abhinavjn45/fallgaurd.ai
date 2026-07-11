import React, { createContext, useState, useEffect, useContext } from 'react';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null); // null when logged out
  const [activePatientId, setActivePatientId] = useState('p-1'); // defaults to Kamala Devi

  // List of connected patients & devices with detailed history logs and recent activities
  const patients = [
    { 
      id: 'p-1', 
      name: 'Kamala Devi', 
      deviceName: "Kamala's Hub", 
      age: 71, 
      avatarText: 'KD', 
      location: 'Bedroom', 
      locationTime: '2 mins', 
      temp: '24°C',
      phoneNumber: '+91 98765 43210',
      recentActivities: [
        {
          id: 'act-1',
          title: 'Movement Logged',
          action: 'entered bedroom',
          location: 'bedroom',
          timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString() // 2 mins ago
        },
        {
          id: 'act-2',
          title: 'Activity Logged',
          action: 'sat on sofa',
          location: 'living room',
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString() // 1 hour ago
        },
        {
          id: 'act-3',
          title: 'Movement Logged',
          action: 'entered kitchen',
          location: 'kitchen',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString() // yesterday (26 hours ago)
        }
      ]
    },
    { 
      id: 'p-2', 
      name: 'Ram Prasad', 
      deviceName: "Ram's Hub", 
      age: 74, 
      avatarText: 'RP', 
      location: 'Living Room', 
      locationTime: '1 min', 
      temp: '26°C',
      phoneNumber: '+91 87654 32109',
      recentActivities: [
        {
          id: 'act-1',
          title: 'Movement Logged',
          action: 'entered living room',
          location: 'living room',
          timestamp: new Date(Date.now() - 1000 * 60).toISOString() // 1 min ago
        },
        {
          id: 'act-2',
          title: 'Movement Logged',
          action: 'entered kitchen',
          location: 'kitchen',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 mins ago
        },
        {
          id: 'act-3',
          title: 'Activity Logged',
          action: 'sat on chair',
          location: 'living room',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString() // yesterday (28 hours ago)
        }
      ]
    }
  ];

  // Device online/offline statuses keyed by patient ID
  const [deviceStatuses, setDeviceStatuses] = useState({
    'p-1': 'ONLINE',
    'p-2': 'ONLINE'
  });

  // Active alarms keyed by patient ID
  const [activeAlarms, setActiveAlarms] = useState({
    'p-1': null,
    'p-2': null
  });

  // Real-time visualizer signal modes keyed by patient ID
  const [simSignalModes, setSimSignalModes] = useState({
    'p-1': 'WALKING',
    'p-2': 'WALKING'
  });

  // Pre-populated incident history with patientId fields
  const [historyList, setHistoryList] = useState([
    {
      id: 'h-1',
      patientId: 'p-1',
      eventType: 'CONFIRMED_FALL',
      fallClass: 'lateral_fall',
      modelConfidence: 0.92,
      mmwaveConfirmed: true,
      status: 'ACKNOWLEDGED',
      acknowledgedBy: 'Arjun Kumar',
      acknowledgedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'h-2',
      patientId: 'p-1',
      eventType: 'CANCELLED',
      fallClass: 'sitting_fast',
      modelConfidence: 0.84,
      mmwaveConfirmed: true,
      status: 'CANCELLED',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: 'h-3',
      patientId: 'p-2',
      eventType: 'CONFIRMED_FALL',
      fallClass: 'backward_fall',
      modelConfidence: 0.96,
      mmwaveConfirmed: true,
      status: 'ACKNOWLEDGED',
      acknowledgedBy: 'Arjun Kumar',
      acknowledgedAt: new Date(Date.now() - 86400000).toISOString(),
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    }
  ]);

  // Unified countdown timer effect running for all pending alarms
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveAlarms(prevAlarms => {
        const updated = { ...prevAlarms };
        let changed = false;

        Object.keys(updated).forEach(pId => {
          const alarm = updated[pId];
          if (alarm && alarm.status === 'PENDING') {
            changed = true;
            if (alarm.countdown > 0) {
              updated[pId] = { ...alarm, countdown: alarm.countdown - 1 };
            } else {
              // Countdown expired -> Escalate to Confirmed Fall
              const escalatedEvent = {
                id: alarm.id,
                patientId: pId,
                eventType: 'CONFIRMED_FALL',
                fallClass: alarm.fallClass,
                modelConfidence: alarm.confidence,
                mmwaveConfirmed: alarm.stage2Confirmed,
                status: 'CONFIRMED',
                createdAt: alarm.timestamp.toISOString()
              };
              
              setHistoryList(prevList => [escalatedEvent, ...prevList]);
              updated[pId] = { ...alarm, status: 'CONFIRMED' };
            }
          }
        });

        return changed ? updated : prevAlarms;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Helper getters for active patient details
  const activePatient = patients.find(p => p.id === activePatientId);
  const activeDeviceStatus = deviceStatuses[activePatientId];
  const activeAlarm = activeAlarms[activePatientId];
  const simSignalMode = simSignalModes[activePatientId];

  // Helper setter for active signal mode
  const setSimSignalMode = (mode) => {
    setSimSignalModes(prev => ({
      ...prev,
      [activePatientId]: mode
    }));
  };

  // Trigger Fall Simulation for active patient
  const simulateFall = (fallClass = 'forward_fall') => {
    if (activeDeviceStatus === 'OFFLINE') return;
    
    // 1. Trigger IMU Spikes for active patient
    setSimSignalMode('SPIKE');
    
    // 2. Set alarm in PENDING state with 30s countdown
    const alarmId = `evt-${Date.now()}`;
    const newAlarm = {
      id: alarmId,
      timestamp: new Date(),
      countdown: 30,
      fallClass: fallClass,
      confidence: 0.94 + Math.random() * 0.05,
      stage2Confirmed: true,
      status: 'PENDING'
    };

    setTimeout(() => {
      setActiveAlarms(prev => ({
        ...prev,
        [activePatientId]: newAlarm
      }));
    }, 600);
  };

  // Simulate Suppressed ADL for active patient
  const simulateADL = () => {
    if (activeDeviceStatus === 'OFFLINE') return;
    
    setSimSignalMode('SIT_DOWN_SPIKE');
    
    const suppressedEvent = {
      id: `adl-${Date.now()}`,
      patientId: activePatientId,
      eventType: 'CANCELLED',
      fallClass: 'sitting_fast',
      modelConfidence: 0.81,
      mmwaveConfirmed: false,
      status: 'CANCELLED',
      createdAt: new Date().toISOString(),
      isSuppressedADL: true
    };
    
    setTimeout(() => {
      setHistoryList(prev => [suppressedEvent, ...prev]);
      setSimSignalMode('WALKING');
    }, 1500);
  };

  // Kamala's/Ram's Push Button Action (Cancel Alarm)
  const cancelActiveAlarm = () => {
    if (!activeAlarm) return;
    
    const cancelledEvent = {
      id: activeAlarm.id,
      patientId: activePatientId,
      eventType: 'CANCELLED',
      fallClass: activeAlarm.fallClass,
      modelConfidence: activeAlarm.confidence,
      mmwaveConfirmed: activeAlarm.stage2Confirmed,
      status: 'CANCELLED',
      createdAt: new Date().toISOString()
    };

    setHistoryList(prev => [cancelledEvent, ...prev]);
    setActiveAlarms(prev => ({
      ...prev,
      [activePatientId]: null
    }));
    setSimSignalMode('WALKING');
  };

  // Caregiver Acknowledge Alert in App
  const acknowledgeAlarm = (alarmId) => {
    setHistoryList(prev => 
      prev.map(evt => 
        evt.id === alarmId 
          ? { ...evt, status: 'ACKNOWLEDGED', acknowledgedBy: 'Arjun Kumar', acknowledgedAt: new Date().toISOString() } 
          : evt
      )
    );

    // If acknowledged alarm matches active patient, reset active alarms state
    setActiveAlarms(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(pId => {
        if (updated[pId] && updated[pId].id === alarmId) {
          updated[pId] = null;
        }
      });
      return updated;
    });

    setSimSignalMode('WALKING');
  };

  // Toggle active patient heartbeat status
  const toggleHeartbeat = () => {
    setDeviceStatuses(prev => {
      const nextStatus = prev[activePatientId] === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
      
      // If turning offline, cancel active alarm for this patient
      if (nextStatus === 'OFFLINE') {
        setActiveAlarms(prevAlarms => ({
          ...prevAlarms,
          [activePatientId]: null
        }));
      }

      return {
        ...prev,
        [activePatientId]: nextStatus
      };
    });
  };

  const loginUser = (emailOrMobile) => {
    setUser({
      emailOrMobile,
      name: 'Arjun Kumar',
      role: 'Primary Caregiver'
    });
  };

  const logoutUser = () => {
    setUser(null);
    setActivePatientId('p-1');
    setDeviceStatuses({ 'p-1': 'ONLINE', 'p-2': 'ONLINE' });
    setActiveAlarms({ 'p-1': null, 'p-2': null });
    setSimSignalModes({ 'p-1': 'WALKING', 'p-2': 'WALKING' });
  };

  return (
    <AppContext.Provider
      value={{
        user,
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
        toggleHeartbeat,
        loginUser,
        logoutUser,
        historyList
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
