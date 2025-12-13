import { render, screen, waitFor } from '@testing-library/react-native';
import App from './App';
import * as trainingPlanApi from './src/services/trainingPlanApi';

// Mock the training plan API
jest.mock('./src/services/trainingPlanApi');

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading spinner initially', () => {
    // Mock API to never resolve (simulates loading state)
    (trainingPlanApi.getTrainingPlan as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );

    render(<App />);
    expect(screen.getByTestId('loading-indicator')).toBeTruthy();
  });

  it('shows onboarding when no plan exists', async () => {
    // Mock 404 response (no plan)
    (trainingPlanApi.getTrainingPlan as jest.Mock).mockRejectedValue(
      new Error('Not found')
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Welcome to PT App/i)).toBeTruthy();
    });
  });

  it('shows workout screen when plan exists', async () => {
    // Mock successful plan fetch
    (trainingPlanApi.getTrainingPlan as jest.Mock).mockResolvedValue({
      id: '123',
      user_id: 'user123',
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getAllByText(/Today's Workout/i).length).toBeGreaterThan(0);
    });
  });

  it('renders bottom tab navigation when plan exists', async () => {
    // Mock successful plan fetch
    (trainingPlanApi.getTrainingPlan as jest.Mock).mockResolvedValue({
      id: '123',
      user_id: 'user123',
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getAllByText(/Today's Workout/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Training Plan/i)).toBeTruthy();
      expect(screen.getByText(/History/i)).toBeTruthy();
    });
  });
});
