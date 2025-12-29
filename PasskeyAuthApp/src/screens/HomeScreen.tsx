import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, Alert, Platform} from 'react-native';
import {Button} from '../components/Button';
import {useAuth} from '../contexts/AuthContext';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation/types';
import {registerPasskey, isPasskeySupported} from '../services/passkeyService';
import {useTranslation} from '../localization';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
  const {user, authMethod, logout} = useAuth();
  const {t, language} = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    Alert.alert(t('homeLogoutConfirmTitle'), t('homeLogoutConfirmMessage'), [
      {
        text: t('homeLogoutCancel'),
        style: 'cancel',
      },
      {
        text: t('homeLogoutConfirm'),
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const handleManagePasskey = async () => {
    if (!isPasskeySupported()) {
      Alert.alert(
        t('homePasskeyNotSupportedTitle'),
        t('homePasskeyNotSupportedMessage'),
        [{text: t('commonOk')}],
      );
      return;
    }

    if (!user?.username) {
      Alert.alert(t('homeUserFetchErrorTitle'), t('homeUserFetchErrorMessage'));
      return;
    }

    setLoading(true);
    try {
      const result = await registerPasskey(user.username);
      if (result === 'skipped') {
        Alert.alert(
          t('homePasskeyAlreadyRegisteredTitle'),
          t('homePasskeyAlreadyRegisteredMessage'),
          [{text: t('commonOk')}],
        );
        return;
      }
      Alert.alert(
        t('homePasskeyRegisterSuccessTitle'),
        t('homePasskeyRegisterSuccessMessage'),
        [{text: t('commonOk')}],
      );
    } catch (error: any) {
      Alert.alert(t('homePasskeyRegisterFailedTitle'), error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDiagnostics = () => {
    navigation.navigate('Diagnostics');
  };

  const getAuthMethodText = () => {
    switch (authMethod) {
      case 'password':
        return t('homeAuthMethodPassword');
      case 'passkey':
        return t('homeAuthMethodPasskey');
      default:
        return t('homeAuthMethodUnknown');
    }
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toLocaleString(language === 'ja' ? 'ja-JP' : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.successIcon}>✓</Text>
          <Text style={styles.title}>{t('homeTitle')}</Text>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>{t('homeAuthMethodLabel')}</Text>
            <Text style={styles.infoValue}>{getAuthMethodText()}</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>{t('homeUsernameLabel')}</Text>
            <Text style={styles.infoValue}>
              {user?.username || t('homeAuthMethodUnknown')}
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>{t('homeAuthTimeLabel')}</Text>
            <Text style={styles.infoValue}>{getCurrentDateTime()}</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>{t('homeUserIdLabel')}</Text>
            <Text style={styles.infoValueSmall}>
              {user?.id || t('homeAuthMethodUnknown')}
            </Text>
          </View>
        </View>

        <View style={styles.description}>
          <Text style={styles.descriptionTitle}>
            {t('homeDescriptionTitle')}
          </Text>
          <Text style={styles.descriptionText}>
            {authMethod === 'password'
              ? t('homeDescriptionPassword')
              : t('homeDescriptionPasskey')}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        {authMethod === 'password' && (
          <Button
            title={t('homeRegisterPasskeyButton')}
            onPress={handleManagePasskey}
            variant="secondary"
            style={styles.button}
          />
        )}
        <Button
          title={t('homeDiagnosticsButton')}
          onPress={handleOpenDiagnostics}
          variant="secondary"
          style={styles.button}
        />
        <Button
          title={t('homeLogoutButton')}
          onPress={handleLogout}
          style={styles.button}
        />
      </View>
    </View>
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
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 32,
  },
  successIcon: {
    fontSize: 64,
    color: '#34C759',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  infoContainer: {
    gap: 12,
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
  },
  infoValueSmall: {
    fontSize: 14,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  description: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  buttonContainer: {
    padding: 24,
    gap: 12,
  },
  button: {
    width: '100%',
  },
});
