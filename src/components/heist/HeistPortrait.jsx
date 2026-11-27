import { useTranslation } from 'react-i18next';
import PhotoReveal from '../PhotoReveal';
import { heistMedia } from '../../data/heistThemes.js';

// Corresponding eye positions are approximately (94, 207)/(190, 201)
// and (260, 377)/(435, 367) in the respective source images.
const originalCrop = { x: 0, y: 12, width: 425, height: 500, imageWidth: 572, imageHeight: 777 };
const alternativeCrop = { x: 89, y: 25, width: 773, height: 909.41, imageWidth: 918, imageHeight: 1713 };

export default function HeistPortrait() {
  const { t } = useTranslation();
  const preview = import.meta.env?.DEV
    && ['127.0.0.1', 'localhost', '[::1]'].includes(window.location.hostname);
  return <PhotoReveal className="heist-portrait"
    originalSrc={heistMedia.portrait} alternativeSrc={preview ? heistMedia.previewPortrait : undefined}
    originalCrop={originalCrop} alternativeCrop={alternativeCrop} aspectRatio="425 / 500"
    alt={t('heist.portrait.alt')} alternativeAlt={t('heist.portrait.label')}
    showLabel={preview ? t('heist.portrait.show') : undefined} hideLabel={t('heist.portrait.hide')}
    radius={108} softness={54} />;
}
