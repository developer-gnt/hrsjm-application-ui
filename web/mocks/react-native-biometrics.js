export class ReactNativeBiometrics {
  async isSensorAvailable() {
    return { available: false, biometryType: undefined };
  }
  async createKeys() {
    return { publicKey: '' };
  }
  async deleteKeys() {
    return { keysDeleted: true };
  }
  async createSignature() {
    return { success: false };
  }
  async simplePrompt() {
    return { success: false };
  }
}

export const BiometryTypes = {
  TouchID: 'TouchID',
  FaceID: 'FaceID',
  Biometrics: 'Biometrics',
};

export default ReactNativeBiometrics;
