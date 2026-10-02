/**
 * Web-preview shim for @react-native/assets-registry/registry.
 * The real RN file mixes ESM import + module.exports and breaks the web
 * optimizer. The preview registers no numeric require() assets, so no-op
 * functions are sufficient.
 */

export function registerAsset() {
  return 0;
}

export function getAssetByID() {
  return null;
}

export default { registerAsset, getAssetByID };
