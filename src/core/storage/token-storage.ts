// In-memory / storage bridge for Auth tokens
let inMemoryAccessToken: string | null = null;
let inMemoryRefreshToken: string | null = null;

export const tokenStorage = {
  getAccessToken: (): string | null => {
    return inMemoryAccessToken;
  },
  setAccessToken: (token: string | null) => {
    inMemoryAccessToken = token;
  },
  getRefreshToken: async (): Promise<string | null> => {
    return inMemoryRefreshToken;
  },
  setRefreshToken: async (token: string | null) => {
    inMemoryRefreshToken = token;
  },
  clearTokens: async () => {
    inMemoryAccessToken = null;
    inMemoryRefreshToken = null;
  },
};
