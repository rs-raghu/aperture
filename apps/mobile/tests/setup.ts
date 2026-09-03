jest.mock("expo-crypto", () => ({
  randomUUID: jest.fn(() => "90000000-0000-4000-8000-000000000010"),
}));
