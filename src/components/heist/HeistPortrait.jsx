import { useTranslation } from 'react-i18next';
import PhotoReveal from '../PhotoReveal';
import { heistMedia } from '../../data/heistThemes.js';

const portraitWidth = 572;
const portraitHeight = 777;

// Align the eyes at (94, 207)/(190, 201) to (260, 377)/(435, 367) with a
// uniform scale. The candidate ends before the base photo's right edge.
const candidateScale = (190 - 94) / (435 - 260);
const candidatePlacement = {
  x: (94 - 260 * candidateScale) / portraitWidth,
  y: (207 - 377 * candidateScale) / portraitHeight,
  width: 918 * candidateScale / portraitWidth,
  fadeRight: .12,
  matte: ['#192950', '#131c30', '#25131a'],
};

export default function HeistPortrait() {
  const { t } = useTranslation();
  const preview = import.meta.env?.DEV
    && ['127.0.0.1', 'localhost', '[::1]'].includes(window.location.hostname);
  return <PhotoReveal className="heist-portrait"
    originalSrc={heistMedia.portrait} alternativeSrc={preview ? heistMedia.previewPortrait : undefined}
    alternativePlacement={candidatePlacement} aspectRatio={`${portraitWidth} / ${portraitHeight}`}
    alt={t('heist.portrait.alt')} alternativeAlt={t('heist.portrait.label')}
    showLabel={preview ? t('heist.portrait.show') : undefined} hideLabel={t('heist.portrait.hide')}
    radius={108} softness={54} />;
}
