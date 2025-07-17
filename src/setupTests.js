// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
// src/setupTests.js
global.self = global;
global.caches = {
  open: jest.fn(),
  match: jest.fn(),
  keys: jest.fn(),
  delete: jest.fn()
};
global.fetch = jest.fn();