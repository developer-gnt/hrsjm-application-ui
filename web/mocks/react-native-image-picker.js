export const launchImageLibrary = async (options, callback) => {
  if (callback) {
    callback({ didCancel: true });
  }
  return { didCancel: true };
};

export const launchCamera = async (options, callback) => {
  if (callback) {
    callback({ didCancel: true });
  }
  return { didCancel: true };
};

export default {
  launchImageLibrary,
  launchCamera,
};
