import {useCallback} from 'react';
import {useLanguage} from './LanguageContext';
import {translate, TranslationKey} from './i18n';

export {LanguageProvider, useLanguage} from './LanguageContext';
export {translate, translateServerMessage} from './i18n';
export type {Language, TranslationKey} from './i18n';

export const useTranslation = () => {
  const {language} = useLanguage();

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) =>
      translate(key, params, language),
    [language],
  );

  return {t, language};
};
