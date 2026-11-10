export default function GaloCrest({ className = 'galo-crest' }) {
  return (
    <svg className={className} viewBox="56 10 208 300" aria-hidden="true" focusable="false">
      {/* The PNG uses transparency for the white details inside the shield. */}
      <path fill="#F5F5F5" stroke="#F5F5F5" strokeWidth="2" d="M160 78C185 108 218 118 253 106C264 199 225 257 160 304C95 257 56 199 67 106C102 118 135 108 160 78Z" />
      <image href="/galo-logo.png" width="320" height="320" />
    </svg>
  );
}
