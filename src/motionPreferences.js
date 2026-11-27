export const MOBILE_LAYOUT_QUERY = '(width < 768px)';
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
export const STATIC_MOTION_QUERY = `${MOBILE_LAYOUT_QUERY}, ${REDUCED_MOTION_QUERY}`;

export const RICK_ARRIVAL_DURATION = 1650;
export const RICK_INTRO_DURATION = { garage: 2450, citadel: RICK_ARRIVAL_DURATION };
