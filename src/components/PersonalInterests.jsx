import { Heart, Tv, Trophy, Crosshair, Swords, Crown, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import perfil from '../data/perfil.json';
import './PersonalInterests.css';

const icons = { 'family-friends': Heart, tv: Tv, sports: Trophy, valorant: Crosshair, chess: Swords, 'clash-royale': Crown };

export default function PersonalInterests() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith('en') ? 'en' : 'pt';
  const { hobbies, series } = perfil.interesses;
  return <section className="personal-interests" aria-label={t('interests.title')}>
    <header><p className="section-eyebrow">{t('interests.eyebrow')}</p><h3>{t('interests.title')}</h3><p>{t('interests.summary')}</p></header>
    <div className="interests-layout">
      <div><h4>{t('interests.hobbies')}</h4><ul className="hobby-list">{hobbies.map(hobby => {
        const Icon = icons[hobby.id];
        return <li key={hobby.id}><span><Icon size={19} aria-hidden="true" /></span>{hobby[lang]}</li>;
      })}</ul></div>
      <div className="series-interest">
        <div className="favorite-series"><span className="favorite-series-icon" aria-hidden="true"><Star size={23} /></span><div><p>{t('interests.favorite')}</p><strong>{series.favorita}</strong></div><span className="favorite-series-mark" aria-hidden="true">Br<br /><b>Ba</b></span></div>
        <details className="watched-series"><summary><Tv size={17} aria-hidden="true" /><span>{t('interests.watched')}<small>{t('interests.showAll', { count: series.assistidas.length })}</small></span></summary><ul>{series.assistidas.map(show => <li key={show.pt}>{show[lang]}{show.pt === series.favorita && <Star size={13} aria-label={t('interests.favorite')} />}</li>)}</ul></details>
      </div>
    </div>
  </section>;
}
