import React, {useEffect} from 'react';
import {act, create} from 'react-test-renderer';
import {LanguageProvider, useLanguage, useTranslation} from '../../src/localization';

jest.mock('../../src/localization/i18n', () => {
  const actual = jest.requireActual('../../src/localization/i18n');
  return {
    ...actual,
    getDeviceLanguage: () => 'en',
  };
});

type Snapshot = {
  language: string;
  welcomeTitle: string;
};

const LanguageProbe: React.FC<{
  onSnapshot: (snapshot: Snapshot) => void;
  onReady: (setter: (lang: 'en' | 'ja') => Promise<void>) => void;
}> = ({onSnapshot, onReady}) => {
  const {language, setLanguage} = useLanguage();
  const {t} = useTranslation();

  useEffect(() => {
    onReady(setLanguage);
  }, [onReady, setLanguage]);

  useEffect(() => {
    onSnapshot({language, welcomeTitle: t('welcomeTitle')});
  }, [language, t, onSnapshot]);

  return null;
};

test('LanguageProvider defaults to device language', async () => {
  let snapshot: Snapshot | null = null;
  let setter: ((lang: 'en' | 'ja') => Promise<void>) | null = null;

  await act(async () => {
    create(
      <LanguageProvider>
        <LanguageProbe
          onSnapshot={next => {
            snapshot = next;
          }}
          onReady={next => {
            setter = next;
          }}
        />
      </LanguageProvider>,
    );
  });

  expect(snapshot).toEqual({
    language: 'en',
    welcomeTitle: 'Passkey Auth App',
  });
  expect(typeof setter).toBe('function');
});

test('setLanguage updates the current translation', async () => {
  let snapshot: Snapshot | null = null;
  let setter: ((lang: 'en' | 'ja') => Promise<void>) | null = null;

  await act(async () => {
    create(
      <LanguageProvider>
        <LanguageProbe
          onSnapshot={next => {
            snapshot = next;
          }}
          onReady={next => {
            setter = next;
          }}
        />
      </LanguageProvider>,
    );
  });

  expect(snapshot?.language).toBe('en');

  await act(async () => {
    if (!setter) {
      throw new Error('setLanguage not available');
    }
    await setter('ja');
  });

  expect(snapshot).toEqual({
    language: 'ja',
    welcomeTitle: 'Passkey認証アプリ',
  });
});
