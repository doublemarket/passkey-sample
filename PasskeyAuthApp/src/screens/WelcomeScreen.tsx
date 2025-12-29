import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Button} from '../components/Button';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation/types';

type WelcomeScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Welcome'
>;

interface WelcomeScreenProps {
  navigation: WelcomeScreenNavigationProp;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({navigation}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Passkey認証アプリ</Text>
        <Text style={styles.subtitle}>
          WebAuthn/FIDO2準拠の{'\n'}パスワードレス認証を体験
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="ログイン"
          onPress={() => navigation.navigate('Login')}
          style={styles.button}
        />
        <Button
          title="新規登録"
          onPress={() => navigation.navigate('Register')}
          variant="secondary"
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
    justifyContent: 'space-between',
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    width: '100%',
  },
});
