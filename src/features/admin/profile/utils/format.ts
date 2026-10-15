/** Small formatting helpers shared across the profile feature. */

export const initialsOf = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return ((parts[0]?.substring(0, 2) as string) || 'AU').toUpperCase();
};
