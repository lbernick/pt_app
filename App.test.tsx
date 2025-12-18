import { render, screen, waitFor } from "@testing-library/react-native";
import App from "./App";
import * as trainingPlanApi from "./src/services/trainingPlanApi";
import * as AuthContext from "./src/contexts/AuthContext";

// Mock @expo/vector-icons
jest.mock("@expo/vector-icons", () => ({
  MaterialIcons: "MaterialIcons",
}));

// Mock the training plan API
jest.mock("./src/services/trainingPlanApi");

// Mock the useApiClient hook to avoid actual API calls
jest.mock("./src/hooks/useApiClient", () => ({
  useApiClient: () => ({
    fetchJson: jest.fn(() => Promise.resolve({ completed: true })),
  }),
}));

// Create a mock auth context that can be updated per test
const mockUser = {
  uid: "test-user-id",
  email: "test@example.com",
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockAuthContext: any = {
  user: mockUser,
  loading: false,
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  getIdToken: jest.fn(() => Promise.resolve("mock-token")),
};

// Mock Firebase Auth
jest.mock("@react-native-firebase/auth", () => {
  const mockAuthInstance = {
    currentUser: mockUser,
  };
  return {
    __esModule: true,

    // default export: auth()
    default: jest.fn(() => mockAuthInstance),
    onAuthStateChanged: jest.fn((_auth, callback) => {
      callback(mockUser);
      return jest.fn();
    }),
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    getIdToken: jest.fn(() => Promise.resolve("mock-token")),
    connectAuthEmulator: jest.fn(),
  };
});

// Mock the AuthContext
jest.spyOn(AuthContext, "useAuth").mockImplementation(() => mockAuthContext);

describe("App", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset to authenticated user by default
    mockAuthContext = {
      user: mockUser,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      getIdToken: jest.fn(() => Promise.resolve("mock-token")),
    };
    jest
      .spyOn(AuthContext, "useAuth")
      .mockImplementation(() => mockAuthContext);
  });

  it("shows loading spinner initially", () => {
    // Mock API to never resolve (simulates loading state)
    (trainingPlanApi.getTrainingPlan as jest.Mock).mockImplementation(
      () => new Promise(() => {}),
    );

    render(<App />);
    expect(screen.getByTestId("loading-indicator")).toBeTruthy();
  });

  it("shows onboarding when no plan exists", async () => {
    // Mock 404 response (no plan)
    (trainingPlanApi.getTrainingPlan as jest.Mock).mockRejectedValue(
      new Error("Not found"),
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Hi! I'm your personal trainer/i)).toBeTruthy();
    });
  });

  it("shows workout screen when plan exists", async () => {
    // Mock successful plan fetch
    (trainingPlanApi.getTrainingPlan as jest.Mock).mockResolvedValue({
      id: "123",
      user_id: "user123",
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getAllByText(/Today's Workout/i).length).toBeGreaterThan(0);
    });
  });

  it("renders bottom tab navigation when plan exists", async () => {
    // Mock successful plan fetch
    (trainingPlanApi.getTrainingPlan as jest.Mock).mockResolvedValue({
      id: "123",
      user_id: "user123",
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getAllByText(/Today's Workout/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Training Plan/i)).toBeTruthy();
      expect(screen.getByText(/History/i)).toBeTruthy();
    });
  });
  it("renders sign in screen when not authenticated", () => {
    mockAuthContext.user = null;
    jest
      .spyOn(AuthContext, "useAuth")
      .mockImplementation(() => mockAuthContext);
    render(<App />);
    expect(screen.getAllByText(/Sign In/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Welcome back to PT App/i)).toBeTruthy();
  });

  it("renders email and password inputs on sign in screen", () => {
    mockAuthContext.user = null;
    jest
      .spyOn(AuthContext, "useAuth")
      .mockImplementation(() => mockAuthContext);
    render(<App />);
    expect(screen.getByPlaceholderText(/Email/i)).toBeTruthy();
    expect(screen.getByPlaceholderText(/Password/i)).toBeTruthy();
  });

  it("renders sign up link on sign in screen", () => {
    mockAuthContext.user = null;
    jest
      .spyOn(AuthContext, "useAuth")
      .mockImplementation(() => mockAuthContext);
    render(<App />);
    expect(screen.getByText(/Don't have an account\?/i)).toBeTruthy();
    expect(screen.getByText(/Sign Up/i)).toBeTruthy();
  });
});
