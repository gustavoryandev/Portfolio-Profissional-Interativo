import { useTranslation } from 'react-i18next';
import PhotoReveal from '../PhotoReveal';
import { heistMedia } from '../../data/heistThemes.js';

const portraitWidth = 572;
const portraitHeight = 777;

export default function HeistPortrait() {
  const { t } = useTranslation();
  return <PhotoReveal className="heist-portrait"
    originalSrc={heistMedia.portrait} alternativeSrc={heistMedia.maskedPortrait}
    aspectRatio={`${portraitWidth} / ${portraitHeight}`}
    alt={t('heist.portrait.alt')} alternativeAlt={t('heist.portrait.label')}
    showLabel={t('heist.portrait.show')} hideLabel={t('heist.portrait.hide')}
    radius={108} softness={54} />;
}
