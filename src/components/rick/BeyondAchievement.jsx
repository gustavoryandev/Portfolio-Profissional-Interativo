import { useContext } from 'react';
import { Compass } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../../context/ThemeState';

export default function BeyondAchievement() {
  const { achievementVisible } = useContext(ThemeContext);
  const { t } = useTranslation();
  return <div className="beyond-achievement-region" role="status" aria-atomic="true">
    {achievementVisible && <div className="beyond-achievement">
      <Compass size={25} aria-hidden="true" />
      <p><span>{t('rick.beyond.earned')}</span><strong>{t('rick.beyond.achievement')}</strong></p>
    </div>}
  </div>;
}
