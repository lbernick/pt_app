import { render, screen, fireEvent } from '@testing-library/react-native';
import App from './App';

describe('App', () => {
  it('renders workout screen by default', () => {
    render(<App />);
    expect(screen.getAllByText(/Today's workout/i).length).toBeGreaterThan(0);
  });

  it('renders bottom tab navigation', () => {
    render(<App />);
    expect(screen.getAllByText(/Today's Workout/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/AI Chat/i)).toBeTruthy();
  });

  it('navigates to chat screen when chat tab is pressed', () => {
    render(<App />);
    const chatTab = screen.getByLabelText(/AI Chat, tab/i);
    fireEvent.press(chatTab);
    expect(screen.getByText(/Hello! How can I help you today?/i)).toBeTruthy();
  });

  it('renders chat input on chat screen', () => {
    render(<App />);
    const chatTab = screen.getByLabelText(/AI Chat, tab/i);
    fireEvent.press(chatTab);
    expect(screen.getByPlaceholderText(/Type a message/i)).toBeTruthy();
  });
});
