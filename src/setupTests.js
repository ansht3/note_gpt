// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
import { configure } from "@testing-library/react";
import "jest-axe/extend-expect";
import "whatwg-fetch";
import { server } from "./mocks/server";

// Extend expect with custom matchers
expect.extend({
  toHaveNoViolations: require("jest-axe").toHaveNoViolations,
});

// Configure Testing Library
configure({
  testIdAttribute: "data-testid",
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {
    return null;
  }
  unobserve() {
    return null;
  }
  disconnect() {
    return null;
  }
};

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {
    return null;
  }
  unobserve() {
    return null;
  }
  disconnect() {
    return null;
  }
};

// Setup MSW
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Suppress console errors during tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (/Warning.*not wrapped in act/.test(args[0])) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Clean up after each test
afterEach(() => {
  // Clean up any mounted components
  document.body.innerHTML = "";

  // Clear all mocks
  jest.clearAllMocks();

  // Clear local storage
  localStorage.clear();
  sessionStorage.clear();
});

// Add custom matchers
expect.extend({
  toBeValidDate(received) {
    const pass = received instanceof Date && !isNaN(received);
    return {
      pass,
      message: () => `expected ${received} to be a valid date`,
    };
  },
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    return {
      pass,
      message: () =>
        `expected ${received} to be within range ${floor} - ${ceiling}`,
    };
  },
});
