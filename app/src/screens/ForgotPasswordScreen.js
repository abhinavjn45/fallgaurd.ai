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
import { Feather } from '@expo/vector-icons';

export default function ForgotPasswordScreen({ onNavigate }) {
  const [step, setStep] = useState('REQUEST'); // 'REQUEST', 'OTP', 'NEW_PASSWORD', 'SUCCESS'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [secureNewPassword, setSecureNewPassword] = useState(true);
  const [secureConfirmPassword, setSecureConfirmPassword] = useState(true);

  // Keyboard visibility tracker to adjust header spacing
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

  const handleSendResetCode = () => {
    if (email.trim().length > 0) {
      setStep('OTP');
    }
  };

  const handleVerifyOtp = () => {
    if (otp.length >= 4) {
      setStep('NEW_PASSWORD');
    }
  };

  const handleResetPassword = () => {
    if (newPassword.trim().length > 0 && newPassword === confirmPassword) {
      setStep('SUCCESS');
    }
  };

  // Muted email for user privacy
  const getMaskedEmail = () => {
    const parts = email.split('@');
    if (parts.length === 2) {
      const name = parts[0];
      const maskedName = name.length > 2 ? name.substring(0, 2) + '***' : name + '***';
      return `${maskedName}@${parts[1]}`;
    }
    return email;
  };

  const handleBackAction = () => {
    if (step === 'REQUEST') {
      onNavigate('LOGIN');
    } else if (step === 'OTP') {
      setStep('REQUEST');
      setOtp('');
    } else if (step === 'NEW_PASSWORD') {
      setStep('OTP');
      setNewPassword('');
      setConfirmPassword('');
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
            {/* Header Row - Hide when keyboard is up OR when in success step */}
            {!isKeyboardVisible && step !== 'SUCCESS' && (
              <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={handleBackAction}>
                  <Feather name="arrow-left" size={20} color="#1E1E1E" />
                </Pressable>
                <View style={styles.headerBrand}>
                  <Feather name="shield" size={16} color="#1E1E1E" style={styles.headerLogo} />
                  <Text style={styles.headerTitle}>FALLGUARD</Text>
                </View>
                <View style={styles.headerSpacer} />
              </View>
            )}

            {/* Spacer when header is hidden */}
            {isKeyboardVisible && step !== 'SUCCESS' && <View style={styles.keyboardTopSpacer} />}

            {/* Render Steps */}
            {step === 'REQUEST' && (
              <View style={styles.formContainer}>
                <Text style={styles.welcomeText}>Reset Password</Text>
                <Text style={styles.instructionText}>Enter your email address to receive a password reset verification code.</Text>

                {/* Email Input */}
                <View style={styles.fieldsGroup}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Email Address</Text>
                    <TextInput 
                      style={styles.input}
                      placeholder="Enter registered email"
                      placeholderTextColor="#8E8E93"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                    />
                  </View>
                </View>

                <Pressable 
                  style={[
                    styles.submitButton,
                    email.trim().length === 0 && styles.submitButtonDisabled
                  ]}
                  onPress={handleSendResetCode}
                  disabled={email.trim().length === 0}
                >
                  <Text style={styles.submitButtonText}>Send Code</Text>
                </Pressable>
              </View>
            )}

            {step === 'OTP' && (
              <View style={styles.formContainer}>
                <Text style={styles.welcomeText}>Enter Code</Text>
                <Text style={styles.instructionText}>
                  We sent a verification code to {getMaskedEmail()}.
                </Text>

                <View style={styles.fieldsGroup}>
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
                </View>

                <Pressable 
                  style={[styles.submitButton, otp.trim().length === 0 && styles.submitButtonDisabled]}
                  onPress={handleVerifyOtp}
                  disabled={otp.trim().length === 0}
                >
                  <Text style={styles.submitButtonText}>Verify Code</Text>
                </Pressable>

                <View style={styles.resendRow}>
                  <Text style={styles.resendText}>Didn't receive code? </Text>
                  <Pressable onPress={handleSendResetCode}>
                    <Text style={styles.resendLink}>Resend</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {step === 'NEW_PASSWORD' && (
              <View style={styles.formContainer}>
                <Text style={styles.welcomeText}>New Password</Text>
                <Text style={styles.instructionText}>Create a new secure password for your account.</Text>

                <View style={styles.fieldsGroup}>
                  {/* New Password */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>New Password</Text>
                    <View style={styles.passwordWrapper}>
                      <TextInput 
                        style={styles.passwordInput}
                        placeholder="Enter new password"
                        placeholderTextColor="#8E8E93"
                        secureTextEntry={secureNewPassword}
                        autoCapitalize="none"
                        value={newPassword}
                        onChangeText={setNewPassword}
                      />
                      <Pressable 
                        style={styles.eyeIcon} 
                        onPress={() => setSecureNewPassword(!secureNewPassword)}
                      >
                        <Feather name={secureNewPassword ? "eye-off" : "eye"} size={18} color="#5A626A" />
                      </Pressable>
                    </View>
                  </View>

                  {/* Confirm Password */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Confirm Password</Text>
                    <View style={styles.passwordWrapper}>
                      <TextInput 
                        style={styles.passwordInput}
                        placeholder="Confirm new password"
                        placeholderTextColor="#8E8E93"
                        secureTextEntry={secureConfirmPassword}
                        autoCapitalize="none"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                      />
                      <Pressable 
                        style={styles.eyeIcon} 
                        onPress={() => setSecureConfirmPassword(!secureConfirmPassword)}
                      >
                        <Feather name={secureConfirmPassword ? "eye-off" : "eye"} size={18} color="#5A626A" />
                      </Pressable>
                    </View>
                  </View>
                </View>

                <Pressable 
                  style={[
                    styles.submitButton,
                    (newPassword.trim().length === 0 || newPassword !== confirmPassword) && styles.submitButtonDisabled
                  ]}
                  onPress={handleResetPassword}
                  disabled={newPassword.trim().length === 0 || newPassword !== confirmPassword}
                >
                  <Text style={styles.submitButtonText}>Reset Password</Text>
                </Pressable>
              </View>
            )}

            {step === 'SUCCESS' && (
              <View style={styles.successContainer}>
                {/* Minimalist Success Icon */}
                <View style={styles.successIconWrapper}>
                  <Feather name="check" size={32} color="#F9F6F0" />
                </View>
                
                <Text style={styles.successTitle}>Password Reset</Text>
                <Text style={styles.successSubtitle}>
                  Your security credentials have been updated successfully. You can now sign in with your new password.
                </Text>

                <Pressable 
                  style={styles.submitButton}
                  onPress={() => onNavigate('LOGIN')}
                >
                  <Text style={styles.submitButtonText}>Back to Sign In</Text>
                </Pressable>
              </View>
            )}

            {/* Empty bottom section to keep layout alignment consistent across pages */}
            <View style={styles.bottomSpacer} />
          </ScrollView>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
    backgroundColor: '#F9F6F0',
  },
  container: {
    flex: 1,
    backgroundColor: '#F9F6F0',
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
    marginVertical: 40,
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
    lineHeight: 20,
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
    borderColor: '#D4CFC5',
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
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  resendText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#5A626A',
  },
  resendLink: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1E1E1E',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 60,
  },
  successIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 28,
    color: '#1E1E1E',
    marginBottom: 12,
    textAlign: 'center',
  },
  successSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#5A626A',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  bottomSpacer: {
    height: 30,
  },
});
