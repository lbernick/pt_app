import { render, screen } from '@testing-library/react-native';
import App from './App';

describe('App', () => {
  it('renders chat interface with messages', () => {
    render(<App />);
    expect(screen.getByText(/Hello! How can I help you today?/i)).toBeTruthy();
  });

  it('renders chat input', () => {
    render(<App />);
    expect(screen.getByPlaceholderText(/Type a message/i)).toBeTruthy();
  });
});
