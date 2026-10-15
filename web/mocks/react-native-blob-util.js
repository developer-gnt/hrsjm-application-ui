export default {
  fs: {
    dirs: {
      DownloadDir: '',
      DocumentDir: '',
      CacheDir: '',
    },
    writeFile: async () => {},
    readFile: async () => '',
    exists: async () => false,
    unlink: async () => {},
  },
  config: () => ({
    fetch: async () => ({
      path: () => '',
    }),
  }),
};
