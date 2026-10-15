export const ACCESSIBLE = {
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'AccessibleWhenUnlockedThisDeviceOnly',
};

export async function setGenericPassword(username, password, options) {
  const service = (options && options.service) || 'default';
  if (typeof window !== 'undefined') {
    window.localStorage?.setItem(`__kc_${service}_${username}`, password);
  }
  return { service, storage: 'localStorage' };
}

export async function getGenericPassword(options) {
  const service = (options && options.service) || 'default';
  const key = `__kc_${service}_hrsjm_refresh_token`;
  const password = typeof window !== 'undefined' ? window.localStorage?.getItem(key) : null;
  if (!password) return false;
  return { username: 'hrsjm_refresh_token', password, service };
}

export async function resetGenericPassword(options) {
  const service = (options && options.service) || 'default';
  if (typeof window !== 'undefined') {
    window.localStorage?.removeItem(`__kc_${service}_hrsjm_refresh_token`);
  }
  return true;
}

export default {
  ACCESSIBLE,
  setGenericPassword,
  getGenericPassword,
  resetGenericPassword,
};
