// Mock Supabase
jest.mock('./src/utils/supabaseClient', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signIn: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
    })),
  },
}));

// Suppress console errors during tests
global.console.error = jest.fn();
global.console.warn = jest.fn();
