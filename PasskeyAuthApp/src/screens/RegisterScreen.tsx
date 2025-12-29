import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import {Button} from '../components/Button';
import {Input} from '../components/Input';
import {useAuth} from '../contexts/AuthContext';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation/types';
import {registerPasskey, isPasskeySupported} from '../services/passkeyService';
import {useTranslation} from '../localization';

type RegisterScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Register'
>;

interface RegisterScreenProps {
  navigation: RegisterScreenNavigationProp;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({navigation}) => {
  const {register} = useAuth();
  const {t} = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registerWithPasskey, setRegisterWithPasskey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });

  const validateForm = () => {
    let valid = true;
    const newErrors = {username: '', password: '', confirmPassword: ''};

    if (!username.trim()) {
      newErrors.username = t('registerValidationUsernameRequired');
      valid = false;
    } else if (username.length < 3) {
      newErrors.username = t('registerValidationUsernameLength');
      valid = false;
    }

    if (!password) {
      newErrors.password = t('registerValidationPasswordRequired');
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = t('registerValidationPasswordLength');
      valid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = t('registerValidationConfirmPasswordRequired');
      valid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = t('registerValidationPasswordMismatch');
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const result = await register({username, password});
      if (result.success) {
        if (registerWithPasskey && isPasskeySupported()) {
          // Register a passkey.
          try {
            const passkeyResult = await registerPasskey(username);
            const message =
              passkeyResult === 'skipped'
                ? t('registerSuccessPasskeySkipped')
                : t('registerSuccessAccountAndPasskey');
            Alert.alert(t('registerSuccessTitle'), message, [
              {
                text: t('commonOk'),
                onPress: () => navigation.navigate('Login'),
              },
            ]);
          } catch (passkeyError: any) {
            // Even if passkey registration fails, the account was created.
            Alert.alert(
              t('registerSuccessTitle'),
              t('registerSuccessWithPasskeyError', {
                error: passkeyError.message,
              }),
              [
                {
                  text: t('commonOk'),
                  onPress: () => navigation.navigate('Login'),
                },
              ]
            );
          }
        } else {
          Alert.alert(
            t('registerSuccessTitle'),
            t('registerSuccessAccountCreated'),
            [
              {
                text: t('commonOk'),
                onPress: () => navigation.navigate('Login'),
              },
            ]
          );
        }
      } else {
        Alert.alert(t('registerFailedTitle'), result.message);
      }
    } catch (error: any) {
      Alert.alert(t('commonError'), error.message || t('errorsRegisterFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>{t('registerTitle')}</Text>
          <Text style={styles.subtitle}>{t('registerSubtitle')}</Text>
        </View>

        <View style={styles.form}>
          <Input
            label={t('registerUsernameLabel')}
            value={username}
            onChangeText={setUsername}
            placeholder={t('registerUsernamePlaceholder')}
            autoCapitalize="none"
            error={errors.username}
          />

          <Input
            label={t('registerPasswordLabel')}
            value={password}
            onChangeText={setPassword}
            placeholder={t('registerPasswordPlaceholder')}
            secureTextEntry
            error={errors.password}
          />

          <Input
            label={t('registerConfirmPasswordLabel')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder={t('registerConfirmPasswordPlaceholder')}
            secureTextEntry
            error={errors.confirmPassword}
          />

          {isPasskeySupported() && (
            <View style={styles.passkeyOption}>
              <View style={styles.passkeyTextContainer}>
                <Text style={styles.passkeyLabel}>
                  {t('registerPasskeyLabel')}
                </Text>
                <Text style={styles.passkeySubtext}>
                  {t('registerPasskeySubtext')}
                </Text>
              </View>
              <Switch
                value={registerWithPasskey}
                onValueChange={setRegisterWithPasskey}
                disabled={loading}
              />
            </View>
          )}

          <Button
            title={t('registerButton')}
            onPress={handleRegister}
            loading={loading}
            style={styles.button}
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.linkContainer}>
            <Text style={styles.linkText}>
              {t('registerHaveAccount')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginTop: 40,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    flex: 1,
  },
  passkeyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  passkeyTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  passkeyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  passkeySubtext: {
    fontSize: 14,
    color: '#666',
  },
  button: {
    marginTop: 24,
  },
  linkContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14,
  },
});
