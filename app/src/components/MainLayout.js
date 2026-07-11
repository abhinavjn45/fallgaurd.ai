import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Pressable, 
  Modal, 
  TouchableWithoutFeedback, 
  Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, AntDesign } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function MainLayout({ children, currentScreen, onNavigate, onLogout }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Bottom navigation tabs mapping
  const tabs = [
    { name: 'HISTORY', label: 'History', icon: 'clock' },
    { name: 'REMINDERS', label: 'Reminders', icon: 'bell' },
    { name: 'DASHBOARD', label: 'Dashboard', icon: 'grid' },
    { name: 'VITALS', label: 'Vitals', icon: 'activity' },
    { name: 'SUPPORT', label: 'Support', icon: 'help-circle' }
  ];

  const handleDrawerItemPress = (screen) => {
    setIsDrawerOpen(false);
    onNavigate(screen);
  };

  const handleLogoutPress = () => {
    setIsDrawerOpen(false);
    onLogout();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Top Navbar */}
      <View style={styles.topNavbar}>
        {/* Left Menu Drawer Trigger */}
        <Pressable 
          style={styles.navButton} 
          onPress={() => setIsDrawerOpen(true)}
        >
          <Feather name="menu" size={22} color="#1E1E1E" />
        </Pressable>

        {/* Center Brand Logo */}
        <View style={styles.logoContainer}>
          <Feather name="shield" size={16} color="#1E1E1E" style={styles.logoIcon} />
          <Text style={styles.logoText}>FALLGUARD</Text>
        </View>

        {/* Right Profile Icon (Avatar) */}
        <Pressable 
          style={styles.avatarButton}
          onPress={() => handleDrawerItemPress('SUPPORT')} // Navigate to support/profile info
        >
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>AK</Text>
          </View>
        </Pressable>
      </View>

      {/* Main Content Area */}
      <View style={styles.contentContainer}>
        {children}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavbar}>
        {tabs.map((tab) => {
          const isActive = currentScreen === tab.name;
          return (
            <Pressable
              key={tab.name}
              style={styles.tabButton}
              onPress={() => onNavigate(tab.name)}
            >
              <Feather 
                name={tab.icon} 
                size={20} 
                color={isActive ? '#1E1E1E' : '#8E8E93'} 
                style={styles.tabIcon}
              />
              <Text style={[
                styles.tabLabel, 
                isActive ? styles.tabLabelActive : styles.tabLabelInactive
              ]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Left Navigation Drawer Modal */}
      <Modal
        visible={isDrawerOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDrawerOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsDrawerOpen(false)}>
          <View style={styles.drawerBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.drawerContent}>
                {/* Profile Card inside Drawer */}
                <View style={styles.profileSection}>
                  <View style={styles.profileAvatarLarge}>
                    <Text style={styles.profileAvatarLargeText}>AK</Text>
                  </View>
                  <Text style={styles.profileName}>Arjun Kumar</Text>
                  <Text style={styles.profileRole}>Primary Caregiver</Text>
                </View>

                {/* Device Status Info */}
                <View style={styles.deviceStatusSection}>
                  <Text style={styles.deviceLabel}>LINKED DEVICE</Text>
                  <Text style={styles.deviceName}>Kamala's Sensor Hub</Text>
                  <View style={styles.deviceDetailRow}>
                    <View style={styles.deviceDetailItem}>
                      <Feather name="battery" size={12} color="#5A626A" />
                      <Text style={styles.deviceDetailText}>98%</Text>
                    </View>
                    <View style={styles.deviceDetailItem}>
                      <Feather name="wifi" size={12} color="#5A626A" />
                      <Text style={styles.deviceDetailText}>Excellent</Text>
                    </View>
                  </View>
                </View>

                {/* Drawer Menu List */}
                <View style={styles.menuList}>
                  <Pressable 
                    style={styles.menuItem}
                    onPress={() => handleDrawerItemPress('DASHBOARD')}
                  >
                    <Feather name="grid" size={18} color="#1E1E1E" style={styles.menuItemIcon} />
                    <Text style={styles.menuItemText}>Dashboard</Text>
                  </Pressable>

                  <Pressable 
                    style={styles.menuItem}
                    onPress={() => handleDrawerItemPress('HISTORY')}
                  >
                    <Feather name="clock" size={18} color="#1E1E1E" style={styles.menuItemIcon} />
                    <Text style={styles.menuItemText}>Event History</Text>
                  </Pressable>

                  <Pressable 
                    style={styles.menuItem}
                    onPress={() => handleDrawerItemPress('REMINDERS')}
                  >
                    <Feather name="bell" size={18} color="#1E1E1E" style={styles.menuItemIcon} />
                    <Text style={styles.menuItemText}>Reminders</Text>
                  </Pressable>

                  <Pressable 
                    style={styles.menuItem}
                    onPress={() => handleDrawerItemPress('VITALS')}
                  >
                    <Feather name="activity" size={18} color="#1E1E1E" style={styles.menuItemIcon} />
                    <Text style={styles.menuItemText}>Elder Vitals</Text>
                  </Pressable>

                  <View style={styles.menuDivider} />

                  <Pressable 
                    style={styles.menuItem}
                    onPress={() => handleDrawerItemPress('SUPPORT')}
                  >
                    <Feather name="help-circle" size={18} color="#1E1E1E" style={styles.menuItemIcon} />
                    <Text style={styles.menuItemText}>Help & Support</Text>
                  </Pressable>

                  <Pressable 
                    style={[styles.menuItem, styles.logoutMenuItem]}
                    onPress={handleLogoutPress}
                  >
                    <Feather name="log-out" size={18} color="#C93B3B" style={styles.menuItemIcon} />
                    <Text style={[styles.menuItemText, styles.logoutItemText]}>Sign Out</Text>
                  </Pressable>
                </View>

                {/* Footer copyright */}
                <Text style={styles.drawerFooter}>FallGuard AI v1.0.0</Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F6F0', // Alabaster background
  },
  topNavbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1.5,
    borderColor: '#E6E2D8', // Minimal sand divider
    backgroundColor: '#F9F6F0',
  },
  navButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: {
    marginRight: 6,
  },
  logoText: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 15,
    color: '#1E1E1E',
    letterSpacing: 3,
  },
  avatarButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#F9F6F0',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  contentContainer: {
    flex: 1,
  },
  bottomNavbar: {
    flexDirection: 'row',
    height: 64,
    borderTopWidth: 1.5,
    borderColor: '#E6E2D8',
    backgroundColor: '#F9F6F0',
    paddingBottom: 4,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIcon: {
    marginBottom: 4,
  },
  tabLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: '#1E1E1E',
  },
  tabLabelInactive: {
    color: '#8E8E93',
  },
  drawerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(30, 30, 30, 0.4)', // Dark overlay
  },
  drawerContent: {
    width: width * 0.75,
    height: '100%',
    backgroundColor: '#F9F6F0',
    borderRightWidth: 1.5,
    borderColor: '#D4CFC5',
    padding: 24,
    justifyContent: 'space-between',
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 24,
  },
  profileAvatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileAvatarLargeText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#F9F6F0',
    fontSize: 20,
    letterSpacing: 1,
  },
  profileName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: '#1E1E1E',
    marginBottom: 2,
  },
  profileRole: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#5A626A',
  },
  deviceStatusSection: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#E6E2D8',
    borderRadius: 6,
    padding: 12,
    marginBottom: 24,
  },
  deviceLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    color: '#8E8E93',
    letterSpacing: 1,
    marginBottom: 4,
  },
  deviceName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1E1E1E',
    marginBottom: 8,
  },
  deviceDetailRow: {
    flexDirection: 'row',
    gap: 16,
  },
  deviceDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deviceDetailText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#5A626A',
  },
  menuList: {
    flex: 1,
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 4,
  },
  menuItemIcon: {
    marginRight: 16,
  },
  menuItemText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: '#1E1E1E',
  },
  menuDivider: {
    height: 1.5,
    backgroundColor: '#E6E2D8',
    marginVertical: 8,
  },
  logoutMenuItem: {
    marginTop: 'auto',
  },
  logoutItemText: {
    color: '#C93B3B',
  },
  drawerFooter: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 20,
  },
});
