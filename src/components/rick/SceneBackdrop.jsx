import { backdropAssets, compactBackdropQuery } from './sceneAssets';

export default function SceneBackdrop({ scene, className, onReady }) {
  const { compact, src } = backdropAssets[scene];
  return <picture className={className}>
    {compact && <source media={compactBackdropQuery} srcSet={compact} />}
    <img src={src} alt="" decoding="async" fetchPriority={onReady ? 'high' : undefined} onLoad={onReady}
      onError={event => { event.currentTarget.hidden = true; onReady?.(); }} />
  </picture>;
}
