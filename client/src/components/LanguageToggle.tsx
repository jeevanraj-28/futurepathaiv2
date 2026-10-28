import React from 'react';
import { Segmented } from './ui';
import { useT, type Lang } from '../lib/i18n';

export const LanguageToggle: React.FC = () => {
  const { lang, setLang, t } = useT();
  return (
    <Segmented<Lang>
      size="sm"
      label={t('language')}
      value={lang}
      onChange={setLang}
      options={[{ value: 'en', label: 'English' }, { value: 'hi', label: 'हिन्दी' }]}
    />
  );
};
