// Testing setup executed after the test framework is installed in the environment.
// Provides helpful DOM matchers and config for React Testing Library.

import '@testing-library/jest-dom';

// Polyfill for TextEncoder/TextDecoder (required by React Router in Jest)
import { TextEncoder, TextDecoder } from 'util';

Object.assign(global, {
  TextEncoder,
  TextDecoder,
});
