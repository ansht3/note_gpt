// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
import { configure } from "@testing-library/react";
import "jest-axe/extend-expect";
import "whatwg-fetch";
import { server } from "./mocks/server";
import "jest-canvas-mock";

// Extend expect with custom matchers
expect.extend({
  toHaveNoViolations: require("jest-axe").toHaveNoViolations,
  toHaveBeenCalledOnceWith(received, ...expected) {
    const pass =
      received.mock.calls.length === 1 &&
      JSON.stringify(received.mock.calls[0]) === JSON.stringify(expected);

    return {
      pass,
      message: () =>
        pass
          ? `Expected ${received} not to have been called once with ${expected}`
          : `Expected ${received} to have been called once with ${expected}`,
    };
  },
});

// Configure Testing Library
configure({
  testIdAttribute: "data-testid",
  asyncUtilTimeout: 2000,
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
afterEach(() => {
  server.resetHandlers();
  jest.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});
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

// Mock window.scrollTo
window.scrollTo = jest.fn();

// Custom test utilities
global.mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Helper functions for testing
global.createTestId = (component, element) => `${component}-${element}`;

global.mockApiResponse = (data, options = {}) => ({
  ok: true,
  status: 200,
  json: async () => data,
  ...options,
});

global.mockApiError = (status = 500, message = "Internal Server Error") => ({
  ok: false,
  status,
  json: async () => ({ error: message }),
});

// Custom matchers for async testing
expect.extend({
  async toResolveWith(received, expected) {
    try {
      const result = await received;
      const pass = JSON.stringify(result) === JSON.stringify(expected);
      return {
        pass,
        message: () =>
          pass
            ? `Expected promise not to resolve with ${expected}`
            : `Expected promise to resolve with ${expected}`,
      };
    } catch (error) {
      return {
        pass: false,
        message: () =>
          `Expected promise to resolve, but it rejected with ${error}`,
      };
    }
  },
});

// Mock timing functions
jest.useFakeTimers();

// Test utilities for async operations
global.waitForAsync = () => new Promise((resolve) => setImmediate(resolve));

// Mock fetch
global.fetch = jest.fn();

// Helper for testing file uploads
global.createMockFile = (
  name = "test.txt",
  type = "text/plain",
  content = ""
) => {
  const blob = new Blob([content], { type });
  return new File([blob], name, { type });
};

// Helper for testing drag and drop
global.createDragEvent = (type, data = {}) => {
  const event = new Event(type, { bubbles: true });
  event.dataTransfer = {
    getData: jest.fn((format) => data[format]),
    setData: jest.fn(),
    dropEffect: "none",
    effectAllowed: "all",
    files: [],
    items: [],
    types: Object.keys(data),
  };
  return event;
};

// Mock clipboard API
Object.defineProperty(navigator, "clipboard", {
  value: {
    writeText: jest.fn(),
    readText: jest.fn(),
  },
});

// Mock media queries
global.mockMatchMedia = (matches) => {
  window.matchMedia.mockImplementation((query) => ({
    matches,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
};
