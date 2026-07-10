import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  Pressable, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableWithoutFeedback, 
  Keyboard,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather, AntDesign } from '@expo/vector-icons';

export default function LoginScreen({ onNavigate, onLoginSuccess }) {
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'mobile'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  
  // Track keyboard visibility to hide header and prevent layout collision
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setIsKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleLogin = () => {
    if (onLoginSuccess) {
      onLoginSuccess();
    } else {
      onNavigate('DASHBOARD');
    }
  };

  const handleSendOtp = () => {
    if (mobileNumber.length >= 10) {
      setOtpSent(true);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardAvoid}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.container}>
          <StatusBar style="dark" />
          
          <ScrollView
            contentContainerStyle={[
              styles.scrollContainer,
              isKeyboardVisible && styles.scrollContainerKeyboard
            ]}
            bounces={false}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header Row - Hidden when typing to free up space */}
            {!isKeyboardVisible && (
              <View style={styles.header}>
                <Pressable 
                  style={styles.backButton} 
                  onPress={() => onNavigate('WELCOME')}
                >
                  <Feather name="arrow-left" size={20} color="#1E1E1E" />
                </Pressable>
                <View style={styles.headerBrand}>
                  <Feather name="shield" size={16} color="#1E1E1E" style={styles.headerLogo} />
                  <Text style={styles.headerTitle}>FALLGUARD</Text>
                </View>
                <View style={styles.headerSpacer} />
              </View>
            )}

            {/* Spacer when header is hidden to prevent content touching the top edge */}
            {isKeyboardVisible && <View style={styles.keyboardTopSpacer} />}

            {/* Form Container */}
            <View style={styles.formContainer}>
              <Text style={styles.welcomeText}>Sign In</Text>
              <Text style={styles.instructionText}>Access your elder safety monitoring hub.</Text>

              {/* Method Tabs */}
              <View style={styles.tabContainer}>
                <Pressable 
                  style={[styles.tabButton, loginMethod === 'email' && styles.tabButtonActive]}
                  onPress={() => {
                    setLoginMethod('email');
                    setOtpSent(false);
                  }}
                >
                  <Text style={[styles.tabButtonText, loginMethod === 'email' && styles.tabButtonTextActive]}>
                    Email
                  </Text>
                </Pressable>
                <Pressable 
                  style={[styles.tabButton, loginMethod === 'mobile' && styles.tabButtonActive]}
                  onPress={() => setLoginMethod('mobile')}
                >
                  <Text style={[styles.tabButtonText, loginMethod === 'mobile' && styles.tabButtonTextActive]}>
                    Mobile
                  </Text>
                </Pressable>
              </View>

              {/* Fields based on active method */}
              {loginMethod === 'email' ? (
                <View style={styles.fieldsGroup}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Email Address</Text>
                    <TextInput 
                      style={styles.input}
                      placeholder="Enter email address"
                      placeholderTextColor="#8E8E93"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                    />
                  </View>
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Password</Text>
                    <View style={styles.passwordWrapper}>
                      <TextInput 
                        style={styles.passwordInput}
                        placeholder="Enter password"
                        placeholderTextColor="#8E8E93"
                        secureTextEntry={secureTextEntry}
                        autoCapitalize="none"
                        value={password}
                        onChangeText={setPassword}
                      />
                      <Pressable 
                        style={styles.eyeIcon} 
                        onPress={() => setSecureTextEntry(!secureTextEntry)}
                      >
                        <Feather name={secureTextEntry ? "eye-off" : "eye"} size={18} color="#5A626A" />
                      </Pressable>
                    </View>
                  </View>

                  <Pressable 
                    style={styles.forgotPassword}
                    onPress={() => onNavigate('FORGOT_PASSWORD')}
                  >
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.fieldsGroup}>
                  {!otpSent ? (
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Mobile Number</Text>
                      <View style={styles.mobileInputWrapper}>
                        <Text style={styles.countryCode}>+91</Text>
                        <TextInput 
                          style={styles.mobileInput}
                          placeholder="10-digit mobile number"
                          placeholderTextColor="#8E8E93"
                          keyboardType="phone-pad"
                          maxLength={10}
                          value={mobileNumber}
                          onChangeText={setMobileNumber}
                        />
                      </View>
                    </View>
                  ) : (
                    <View style={styles.fieldsGroup}>
                      <View style={styles.otpHeader}>
                        <Text style={styles.otpSentAlert}>OTP sent to +91 {mobileNumber}</Text>
                        <Pressable onPress={() => setOtpSent(false)}>
                          <Text style={styles.otpChangeNum}>Change</Text>
                        </Pressable>
                      </View>
                      <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Verification Code</Text>
                        <TextInput 
                          style={styles.input}
                          placeholder="Enter 6-digit OTP"
                          placeholderTextColor="#8E8E93"
                          keyboardType="number-pad"
                          maxLength={6}
                          value={otp}
                          onChangeText={setOtp}
                        />
                      </View>
                      <Pressable style={styles.forgotPassword} onPress={handleSendOtp}>
                        <Text style={styles.forgotPasswordText}>Resend OTP</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              )}

              {/* Main Submit Button */}
              {loginMethod === 'mobile' && !otpSent ? (
                <Pressable 
                  style={[
                    styles.submitButton, 
                    mobileNumber.length < 10 && styles.submitButtonDisabled
                  ]} 
                  onPress={handleSendOtp}
                  disabled={mobileNumber.length < 10}
                >
                  <Text style={styles.submitButtonText}>Send OTP</Text>
                </Pressable>
              ) : (
                <Pressable style={styles.submitButton} onPress={handleLogin}>
                  <Text style={styles.submitButtonText}>Sign In</Text>
                </Pressable>
              )}
            </View>

            {/* Social OAuth & Footer */}
            <View style={styles.bottomSection}>
              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or sign in with</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social Buttons */}
              <View style={styles.socialRow}>
                <Pressable style={styles.socialButton}>
                  <AntDesign name="google" size={18} color="#1E1E1E" style={styles.socialIcon} />
                  <Text style={styles.socialButtonText}>Google</Text>
                </Pressable>
                <Pressable style={styles.socialButton}>
                  <AntDesign name="apple" size={18} color="#1E1E1E" style={styles.socialIcon} />
                  <Text style={styles.socialButtonText}>Apple</Text>
                </Pressable>
              </View>

              {/* Footer Route */}
              <View style={styles.footerRow}>
                <Text style={styles.footerText}>Don't have an account? </Text>
                <Pressable onPress={() => onNavigate('SIGNUP')}>
                  <Text style={styles.footerLinkText}>Sign Up</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
    backgroundColor: '#F9F6F0', // Solid Alabaster matching background
  },
  container: {
    flex: 1,
    backgroundColor: '#F9F6F0', // Solid Alabaster Background
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  scrollContainerKeyboard: {
    paddingBottom: 16,
  },
  keyboardTopSpacer: {
    height: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    marginRight: 6,
  },
  headerTitle: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 14,
    color: '#1E1E1E',
    letterSpacing: 2,
  },
  headerSpacer: {
    width: 40,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    maxHeight: 420, // Keeps it tight on tall screens
  },
  welcomeText: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 28,
    color: '#1E1E1E',
    marginBottom: 6,
  },
  instructionText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#5A626A',
    marginBottom: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1.5,
    borderColor: '#E6E2D8', // Accent Sand
    marginBottom: 24,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderColor: 'transparent',
    marginBottom: -1.5,
  },
  tabButtonActive: {
    borderColor: '#1E1E1E',
  },
  tabButtonText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: '#8E8E93',
  },
  tabButtonTextActive: {
    color: '#1E1E1E',
  },
  fieldsGroup: {
    gap: 16,
    marginBottom: 24,
  },
  inputContainer: {
    gap: 6,
  },
  inputLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#1E1E1E',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    fontFamily: 'Inter_400Regular',
    width: '100%',
    height: 48,
    borderWidth: 1.5,
    borderColor: '#D4CFC5', // Accent Sand/Grey
    borderRadius: 6,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#1E1E1E',
    backgroundColor: 'transparent',
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 48,
    borderWidth: 1.5,
    borderColor: '#D4CFC5',
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  passwordInput: {
    fontFamily: 'Inter_400Regular',
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#1E1E1E',
  },
  eyeIcon: {
    paddingHorizontal: 16,
    height: '100%',
    justifyContent: 'center',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -4,
  },
  forgotPasswordText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#5A626A',
  },
  mobileInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 48,
    borderWidth: 1.5,
    borderColor: '#D4CFC5',
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  countryCode: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#1E1E1E',
    paddingLeft: 16,
    paddingRight: 8,
    borderRightWidth: 1.5,
    borderRightColor: '#D4CFC5',
    marginRight: 12,
  },
  mobileInput: {
    fontFamily: 'Inter_400Regular',
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#1E1E1E',
  },
  otpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  otpSentAlert: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#5A626A',
  },
  otpChangeNum: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1E1E1E',
  },
  submitButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#F9F6F0',
    fontSize: 14,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  bottomSection: {
    width: '100%',
    gap: 16,
    marginTop: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E6E2D8',
  },
  dividerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#8E8E93',
    paddingHorizontal: 12,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    height: 48,
    borderWidth: 1.5,
    borderColor: '#D4CFC5',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  socialIcon: {
    marginRight: 8,
  },
  socialButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1E1E1E',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#5A626A',
  },
  footerLinkText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1E1E1E',
  },
});
