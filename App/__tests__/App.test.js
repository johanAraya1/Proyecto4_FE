import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../App';

describe('App', () => {
  it('renders correctly', () => {
    render(<App />);
    // Este test básico simplemente verifica que la app se renderice sin errores
    expect(true).toBe(true);
  });
});