import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

test('renders the AIMLA homepage shell', () => {
  render(<App />);
  expect(screen.getByRole('heading', { level: 1, name: /TMU AIMLA/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 2, name: /AIMLA Assistant/i })).toBeInTheDocument();
});
