import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

const languages = [
  { code: 'en', label: 'EN' },
  { code: 'ro', label: 'RO' },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const current = i18n.language?.startsWith('ro') ? 'ro' : 'en';

  const toggle = () => {
    const next = current === 'en' ? 'ro' : 'en';
    i18n.changeLanguage(next);
  };

  const nextLang = languages.find((l) => l.code !== current)!;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      className="gap-1.5 text-xs font-bold uppercase tracking-wider"
      aria-label={`Switch to ${nextLang.label}`}
    >
      <Globe size={14} />
      {nextLang.label}
    </Button>
  );
};

export default LanguageSwitcher;
