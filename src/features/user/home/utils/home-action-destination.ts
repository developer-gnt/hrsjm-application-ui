export type HomeActionDestination = 'join' | 'donate' | 'membership';

export const getHomeActionDestination = (
  actionId: string,
): HomeActionDestination | undefined => {
  if (actionId === 'join') {
    return 'join';
  }
  if (actionId === 'donate') {
    return 'donate';
  }
  if (actionId === 'renew' || actionId === 'membership') {
    return 'membership';
  }
  return undefined;
};
