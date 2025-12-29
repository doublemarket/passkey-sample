import React, {useMemo, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Button} from '../components/Button';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation/types';
import {Language, useLanguage, useTranslation} from '../localization';

type WelcomeScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Welcome'
>;

interface WelcomeScreenProps {
  navigation: WelcomeScreenNavigationProp;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({navigation}) => {
  const {t} = useTranslation();
  const {language, setLanguage} = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(language);
  const languageOptions = useMemo(
    () => [
      {code: 'ja' as const, label: t('languageJapanese')},
      {code: 'en' as const, label: t('languageEnglish')},
    ],
    [t],
  );

  const handleLanguageSelect = async (nextLanguage: Language) => {
    setSelectedLanguage(nextLanguage);
    await setLanguage(nextLanguage);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{t('welcomeTitle')}</Text>
        <Text style={styles.subtitle}>{t('welcomeSubtitle')}</Text>
        <View style={styles.languageSection}>
          <Text style={styles.languageTitle}>{t('languageSelectionTitle')}</Text>
          <View style={styles.languageOptions}>
            {languageOptions.map(option => {
              const isSelected = selectedLanguage === option.code;
              return (
                <TouchableOpacity
                  key={option.code}
                  style={[
                    styles.languageOption,
                    isSelected && styles.languageOptionSelected,
                  ]}
                  onPress={() => handleLanguageSelect(option.code)}
                  activeOpacity={0.8}>
                  <Text
                    style={[
                      styles.languageOptionText,
                      isSelected && styles.languageOptionTextSelected,
                    ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title={t('welcomeLogin')}
          onPress={() => navigation.navigate('Login')}
          style={styles.button}
        />
        <Button
          title={t('welcomeRegister')}
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
  languageSection: {
    marginTop: 32,
    alignItems: 'center',
  },
  languageTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  languageOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  languageOption: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  languageOptionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E8F0FF',
  },
  languageOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  languageOptionTextSelected: {
    color: '#007AFF',
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    width: '100%',
  },
});
