import React from 'react';

import type { CharacterId, CharacterMood } from '../lib/characters';

export type { CharacterId, CharacterMood } from '../lib/characters';

const PEOPLE: Record<CharacterId, { label: string; skin: string; shade: string; cloth: string; bg: string; brow: string }> = {
  aarav: { label: 'Student', skin: '#C98763', shade: '#A86A4A', cloth: '#F5F7FA', bg: '#2347D6', brow: '#262626' },
  meera: { label: 'Student', skin: '#B9775A', shade: '#96583F', cloth: '#12805C', bg: '#FFD9BF', brow: '#2A211D' },
  kabir: { label: 'Learner', skin: '#A9694A', shade: '#875036', cloth: '#7C5CD6', bg: '#E4DCFF', brow: '#2B1E17' },
  sunita: { label: 'Parent', skin: '#D9A07A', shade: '#B98260', cloth: '#C2185B', bg: '#FCE3EC', brow: '#1F1A17' },
  rajesh: { label: 'Parent', skin: '#B07454', shade: '#8E5A3E', cloth: '#1E2A44', bg: '#D7F0E6', brow: '#1F1A17' },
  fatima: { label: 'Teacher', skin: '#E2B08C', shade: '#C38F6B', cloth: '#2347D6', bg: '#FFF1E6', brow: '#3A2A20' },
  ananya: { label: 'Counsellor', skin: '#8D5A3F', shade: '#6E4430', cloth: '#0E1A2B', bg: '#EAF0FF', brow: '#3B2A22' },
  harjeet: { label: 'Principal', skin: '#D69C77', shade: '#B67C59', cloth: '#F5F7FA', bg: '#E6F5EF', brow: '#6B6B6B' },
};

/**
 * Flat-style human avatar from the FuturePath cast. Blinks and bobs gently
 * unless `animate` is false (SMIL is skipped for reduced-motion users by the browser setting check below).
 */
export const Character: React.FC<{
  who: CharacterId;
  mood?: CharacterMood;
  size?: number;
  frame?: 'circle' | 'square' | 'none';
  animate?: boolean;
  label?: string;
  className?: string;
}> = ({ who, mood = 'happy', size = 48, frame = 'circle', animate = true, label, className }) => {
  const p = PEOPLE[who];
  const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const anim = animate && !reduce;
  const is = (id: CharacterId) => who === id;
  const happy = mood === 'happy' || mood === 'wave';
  const think = mood === 'think';
  const beard = who === 'harjeet';
  const clipR = frame === 'circle' ? 100 : frame === 'square' ? 36 : 0;
  const clipId = `fpc-${who}-${frame}`;
  const pupilLX = think ? 81 : 86;
  const pupilRX = think ? 113 : 118;
  const pupilY = think ? 93 : 100;
  const browY = mood === 'wow' ? 71 : think ? 74 : 77;

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={className}
      style={{ flexShrink: 0 }}
    >
      <defs>
        <clipPath id={clipId}><rect x="0" y="0" width="200" height="200" rx={clipR} /></clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect x="0" y="0" width="200" height="200" rx={clipR} fill={frame === 'none' ? 'none' : p.bg} />
        <g strokeLinecap="round" strokeLinejoin="round">
          {anim && <animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="3.2s" repeatCount="indefinite" />}

          {is('meera') && <path d="M52 96 Q48 40 100 38 Q152 40 148 96 L152 176 L48 176 Z" fill="#2A211D" />}
          {is('sunita') && <g fill="#1F1A17"><circle cx="100" cy="42" r="20" /><path d="M58 100 Q56 46 100 44 Q144 46 142 100 Z" /></g>}
          {is('fatima') && <path d="M48 112 Q44 36 100 34 Q156 36 152 112 L160 176 Q100 190 40 176 Z" fill="#12805C" />}
          {is('ananya') && (
            <g fill="#3B2A22">
              <circle cx="62" cy="70" r="20" /><circle cx="72" cy="48" r="20" /><circle cx="100" cy="38" r="22" />
              <circle cx="128" cy="48" r="20" /><circle cx="138" cy="70" r="20" /><circle cx="56" cy="98" r="16" />
              <circle cx="144" cy="98" r="16" /><circle cx="58" cy="122" r="13" /><circle cx="142" cy="122" r="13" />
            </g>
          )}

          {!is('fatima') && <g fill={p.shade}><circle cx="62" cy="104" r="11" /><circle cx="138" cy="104" r="11" /></g>}
          <rect x="86" y="128" width="28" height="30" fill={p.shade} />
          <path d="M28 206 Q28 160 66 152 L134 152 Q172 160 172 206 Z" fill={p.cloth} />

          {is('aarav') && (
            <g>
              <polygon points="86,150 100,164 88,172" fill="#DCE3EE" /><polygon points="114,150 100,164 112,172" fill="#DCE3EE" />
              <rect x="95" y="160" width="10" height="8" rx="2" fill="#C2540F" /><polygon points="96,166 104,166 107,198 100,206 93,198" fill="#F2762E" />
            </g>
          )}
          {is('meera') && (
            <g>
              <path d="M88 152 L100 168 L112 152 Z" fill="#0D6B4C" />
              <g fill="#2A211D"><ellipse cx="64" cy="158" rx="8" ry="10" /><ellipse cx="62" cy="175" rx="7.5" ry="9.5" /><ellipse cx="60" cy="191" rx="7" ry="9" /></g>
              <rect x="54" y="198" width="12" height="5" rx="2" fill="#F2762E" />
            </g>
          )}
          {is('sunita') && <g><path d="M62 152 L84 152 L152 206 L118 206 Z" fill="#F2762E" /><path d="M84 152 L152 206" stroke="#E8B33C" strokeWidth="3" fill="none" /></g>}
          {is('rajesh') && (
            <g>
              <polygon points="84,152 100,178 116,152" fill="#BFD0F5" />
              <polygon points="86,150 100,164 90,170" fill="#FFFFFF" /><polygon points="114,150 100,164 110,170" fill="#FFFFFF" />
            </g>
          )}
          {is('fatima') && <path d="M54 118 Q58 162 100 166 Q142 162 146 118 L152 172 Q100 186 48 172 Z" fill="#12805C" />}
          {is('ananya') && <g><polygon points="86,152 100,180 114,152" fill="#FFFFFF" /><path d="M86 152 L96 186 M114 152 L104 186" stroke="#2A3A52" strokeWidth="3" fill="none" /></g>}
          {is('harjeet') && <g fill="#1E2A44"><path d="M28 206 Q28 162 66 154 L86 154 L92 206 Z" /><path d="M172 206 Q172 162 134 154 L114 154 L108 206 Z" /></g>}
          {is('kabir') && (
            <g>
              <path d="M68 150 Q100 176 132 150 L140 160 Q100 190 60 160 Z" fill="#5E43B0" />
              <path d="M92 170 L90 194 M108 170 L110 194" stroke="#FFFFFF" strokeWidth="2.5" fill="none" />
              <path d="M70 146 Q100 174 130 146" stroke="#0E1A2B" strokeWidth="6" fill="none" />
              <circle cx="68" cy="144" r="9" fill="#0E1A2B" /><circle cx="132" cy="144" r="9" fill="#0E1A2B" />
            </g>
          )}

          <rect x="62" y="52" width="76" height="90" rx="26" fill={p.skin} />
          {is('kabir') && <path d="M66 120 Q70 142 100 142 Q130 142 134 120 Q130 134 100 136 Q70 134 66 120 Z" fill="#875036" opacity="0.45" />}

          {is('aarav') && (
            <g fill="#262626">
              <path d="M58 96 Q56 50 100 46 Q144 50 142 96 Q140 72 128 68 L72 68 Q60 72 58 96 Z" />
              <circle cx="70" cy="56" r="13" /><circle cx="88" cy="47" r="14" /><circle cx="108" cy="45" r="14" />
              <circle cx="126" cy="52" r="13" /><circle cx="138" cy="66" r="9" /><circle cx="62" cy="68" r="9" />
            </g>
          )}
          {is('meera') && <path d="M60 92 Q58 50 100 46 Q140 48 140 80 Q116 76 104 58 Q92 84 60 92 Z" fill="#2A211D" />}
          {is('sunita') && <path d="M60 92 Q58 52 100 50 Q142 52 140 92 Q136 70 100 64 Q64 70 60 92 Z" fill="#1F1A17" />}
          {is('rajesh') && (
            <g>
              <path d="M58 92 Q56 48 100 46 Q144 48 142 92 Q140 66 124 62 Q96 68 74 60 Q60 66 58 92 Z" fill="#1F1A17" />
              <rect x="59" y="80" width="6" height="12" rx="3" fill="#9AA3AE" /><rect x="135" y="80" width="6" height="12" rx="3" fill="#9AA3AE" />
            </g>
          )}
          {is('fatima') && <path d="M58 80 Q60 46 100 46 Q140 46 142 80 Q124 64 100 64 Q76 64 58 80 Z" fill="#0F6B4D" />}
          {is('ananya') && <path d="M62 82 Q64 56 100 54 Q136 56 138 82 Q124 70 112 72 Q100 64 88 72 Q76 70 62 82 Z" fill="#3B2A22" />}
          {is('harjeet') && (
            <g>
              <path d="M56 88 Q50 30 100 26 Q150 30 144 88 Q124 72 100 76 Q76 72 56 88 Z" fill="#F2762E" />
              <path d="M64 60 Q100 44 138 62 M60 74 Q100 58 140 76 M100 76 L94 54" stroke="#C2540F" strokeWidth="3" fill="none" />
            </g>
          )}
          {is('kabir') && <path d="M58 92 Q54 46 100 42 Q146 46 142 92 Q138 66 126 70 Q118 54 104 64 Q92 52 82 66 Q70 58 58 92 Z" fill="#2B1E17" />}

          {beard && <path d="M62 106 L62 126 Q64 174 100 178 Q136 174 138 126 L138 106 Q130 120 116 118 Q100 128 84 118 Q70 120 62 106 Z" fill="#4A4A4A" />}
          {is('sunita') && <g><circle cx="100" cy="82" r="3.5" fill="#D2263A" /><circle cx="62" cy="120" r="4.5" fill="#E8B33C" /><circle cx="138" cy="120" r="4.5" fill="#E8B33C" /></g>}
          {is('ananya') && <g fill="#F2762E"><circle cx="62" cy="120" r="4" /><circle cx="138" cy="120" r="4" /></g>}
          {is('meera') && <g fill="#96583F" opacity="0.6"><circle cx="74" cy="114" r="2" /><circle cx="80" cy="118" r="2" /><circle cx="120" cy="118" r="2" /><circle cx="126" cy="114" r="2" /></g>}

          <rect x="73" y={browY} width="22" height="6" rx="3" fill={p.brow} />
          <rect x="105" y={browY} width="22" height="6" rx="3" fill={p.brow} />

          {[84, 116].map((cx) => (
            <ellipse key={cx} cx={cx} cy="98" rx="12" ry="13" fill="#FFFFFF">
              {anim && <animate attributeName="ry" values="13;13;1;13" keyTimes="0;0.9;0.95;1" dur="4.6s" repeatCount="indefinite" />}
            </ellipse>
          ))}
          {[pupilLX, pupilRX].map((cx) => (
            <ellipse key={cx} cx={cx} cy={pupilY} rx="6.5" ry="6.5" fill="#2B2B2B">
              {anim && <animate attributeName="ry" values="6.5;6.5;0.5;6.5" keyTimes="0;0.9;0.95;1" dur="4.6s" repeatCount="indefinite" />}
            </ellipse>
          ))}

          {is('meera') && <g fill="none" stroke="#F2762E" strokeWidth="4"><circle cx="84" cy="98" r="16" /><circle cx="116" cy="98" r="16" /><path d="M99 96 L101 96" /></g>}
          {is('fatima') && <g fill="none" stroke="#2B2B2B" strokeWidth="3.5"><rect x="68" y="86" width="32" height="25" rx="8" /><rect x="100" y="86" width="32" height="25" rx="8" /></g>}

          <path d="M100 106 Q107 118 100 121 Q93 118 100 106 Z" fill={p.shade} />
          {is('rajesh') && <path d="M84 124 Q92 117 100 121 Q108 117 116 124 Q108 127 100 125 Q92 127 84 124 Z" fill="#1F1A17" />}
          {beard && <path d="M82 124 Q92 116 100 121 Q108 116 118 124 Q108 128 100 126 Q92 128 82 124 Z" fill="#5C5C5C" />}

          {happy && !beard && <path d="M88 129 Q100 138 112 129" fill="none" stroke={p.shade} strokeWidth="4.5" />}
          {happy && beard && <g><path d="M88 130 L112 130 Q110 143 100 143 Q90 143 88 130 Z" fill="#6B1F2A" /><rect x="90" y="130" width="20" height="4" rx="1.5" fill="#FFFFFF" /></g>}
          {mood === 'talk' && (
            <ellipse cx="100" cy="133" rx="9" ry="6" fill="#6B1F2A">
              {anim && <animate attributeName="ry" values="6;2.5;6" dur="0.45s" repeatCount="indefinite" />}
            </ellipse>
          )}
          {mood === 'wow' && <ellipse cx="100" cy="134" rx="5.5" ry="7" fill="#6B1F2A" />}
          {think && <path d="M92 134 Q101 133 110 128" fill="none" stroke={p.shade} strokeWidth="4.5" />}

          {mood === 'wave' && (
            <g>
              {anim && <animateTransform attributeName="transform" type="rotate" values="-8 150 178;12 150 178;-8 150 178" dur="1.2s" repeatCount="indefinite" />}
              <path d="M150 178 Q168 150 170 124" fill="none" stroke={p.cloth} strokeWidth="20" />
              <circle cx="170" cy="114" r="11" fill={p.skin} />
            </g>
          )}
        </g>
      </g>
    </svg>
  );
};
