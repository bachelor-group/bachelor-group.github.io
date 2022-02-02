import { render } from '@testing-library/react';
import App from './App';

// Creating Coverage Raport npm test -- --coverage

// Test the actual app, currently test is not working...
test('Renders the App and checks for throws', async () => {
  render(<App />);
  // const linkElement = screen.getByText(/learn react/i);
  // expect(linkElement).toBeInTheDocument();
});
