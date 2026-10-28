export type CharacterId = 'aarav' | 'meera' | 'kabir' | 'sunita' | 'rajesh' | 'fatima' | 'ananya' | 'harjeet';
export type CharacterMood = 'happy' | 'talk' | 'wow' | 'think' | 'wave';

/** Map a signed-in role to the cast member who represents it. */
export const characterForRole = (role?: string): CharacterId => {
  switch (role) {
    case 'PARENT': return 'sunita';
    case 'SCHOOL_ADMIN': return 'harjeet';
    case 'COUNSELOR': return 'ananya';
    case 'PLATFORM_ADMIN': return 'kabir';
    default: return 'aarav';
  }
};
