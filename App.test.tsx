import { render, screen } from '@testing-library/react-native';
import App from './App';

describe('App', () => {
  it('renders workout screen by default', () => {
    render(<App />);
    expect(screen.getAllByText(/Today's workout/i).length).toBeGreaterThan(0);
  });

  it('renders bottom tab navigation', () => {
    render(<App />);
    expect(screen.getAllByText(/Today's Workout/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Training Plan/i)).toBeTruthy();
    expect(screen.getByText(/History/i)).toBeTruthy();
  });
});
