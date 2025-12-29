import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, Alert, Platform} from 'react-native';
import {Button} from '../components/Button';
import {useAuth} from '../contexts/AuthContext';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation/types';
import {registerPasskey, isPasskeySupported} from '../services/passkeyService';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
  const {user, authMethod, logout} = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    Alert.alert('ログアウト', '本当にログアウトしますか？', [
      {
        text: 'キャンセル',
        style: 'cancel',
      },
      {
        text: 'ログアウト',
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
        'Passkey未対応',
        'このデバイスではPasskeyがサポートされていません',
        [{text: 'OK'}]
      );
      return;
    }

    if (!user?.username) {
      Alert.alert('エラー', 'ユーザー情報が取得できません');
      return;
    }

    setLoading(true);
    try {
      const result = await registerPasskey(user.username);
      if (result === 'skipped') {
        Alert.alert(
          'Passkey登録',
          'Passkeyは既に登録されています。',
          [{text: 'OK'}]
        );
        return;
      }
      Alert.alert(
        'Passkey登録完了',
        'Passkeyが正常に登録されました。次回から生体認証でログインできます。',
        [{text: 'OK'}]
      );
    } catch (error: any) {
      Alert.alert('Passkey登録失敗', error.message);
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
        return 'パスワード認証';
      case 'passkey':
        return 'Passkey認証';
      default:
        return '不明';
    }
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toLocaleString('ja-JP', {
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
          <Text style={styles.title}>ログイン成功</Text>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>認証方法</Text>
            <Text style={styles.infoValue}>{getAuthMethodText()}</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>ユーザー名</Text>
            <Text style={styles.infoValue}>{user?.username || '不明'}</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>認証日時</Text>
            <Text style={styles.infoValue}>{getCurrentDateTime()}</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>ユーザーID</Text>
            <Text style={styles.infoValueSmall}>{user?.id || '不明'}</Text>
          </View>
        </View>

        <View style={styles.description}>
          <Text style={styles.descriptionTitle}>🎉 認証が完了しました</Text>
          <Text style={styles.descriptionText}>
            {authMethod === 'password'
              ? 'パスワード認証でログインしました。Passkey機能を有効にすることで、次回から生体認証でログインできるようになります。'
              : 'Passkey認証でログインしました。次回から生体認証のみでログインできます。'}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        {authMethod === 'password' && (
          <Button
            title="Passkeyを追加登録"
            onPress={handleManagePasskey}
            variant="secondary"
            style={styles.button}
          />
        )}
        <Button
          title="診断ツール"
          onPress={handleOpenDiagnostics}
          variant="secondary"
          style={styles.button}
        />
        <Button
          title="ログアウト"
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
