import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createMemoryHistory } from "history";
import { Router } from "react-router-dom";
import HomePage from "../HomePage";

// Mock the react-router-dom useHistory hook
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useHistory: () => ({
    push: jest.fn(),
  }),
}));

describe("HomePage Component", () => {
  const setup = () => {
    const history = createMemoryHistory();
    return render(
      <Router history={history}>
        <HomePage />
      </Router>
    );
  };

  // Tab switching tests
  test("switches between tabs correctly", () => {
    setup();

    // Check default tab
    expect(
      screen.getByPlaceholderText(/https:\/\/example.com/)
    ).toBeInTheDocument();

    // Switch to Upload tab
    fireEvent.click(screen.getByText("Upload"));
    expect(screen.getByText(/drag and drop/i)).toBeInTheDocument();

    // Switch to Text tab
    fireEvent.click(screen.getByText("Text"));
    expect(screen.getByPlaceholderText(/paste your text/i)).toBeInTheDocument();
  });

  // URL input tests
  test("handles URL input submission", async () => {
    setup();
    const input = screen.getByPlaceholderText(/https:\/\/example.com/);
    const submitButton = screen.getByText("Synthesize Now");

    fireEvent.change(input, {
      target: { value: "https://youtube.com/watch?v=123" },
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(input.value).toBe("https://youtube.com/watch?v=123");
    });
  });

  // File upload tests
  test("handles file upload correctly", async () => {
    setup();
    fireEvent.click(screen.getByText("Upload"));

    const file = new File(["test content"], "test.txt", { type: "text/plain" });
    const fileInput = screen.getByRole("button", { name: /drag and drop/i });

    Object.defineProperty(fileInput, "files", {
      value: [file],
    });

    fireEvent.drop(fileInput, {
      dataTransfer: {
        files: [file],
      },
    });

    await waitFor(() => {
      expect(screen.getByText("test.txt")).toBeInTheDocument();
      expect(screen.getByText("Remove")).toBeInTheDocument();
    });
  });

  // Text input tests
  test("handles text input correctly", async () => {
    setup();
    fireEvent.click(screen.getByText("Text"));

    const textarea = screen.getByPlaceholderText(/paste your text/i);
    fireEvent.change(textarea, { target: { value: "Test content" } });

    await waitFor(() => {
      expect(textarea.value).toBe("Test content");
    });
  });

  // Processing state tests
  test("shows processing state during submission", async () => {
    setup();
    const input = screen.getByPlaceholderText(/https:\/\/example.com/);
    const submitButton = screen.getByText("Synthesize Now");

    fireEvent.change(input, {
      target: { value: "https://youtube.com/watch?v=123" },
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(screen.getByText(/processing/i)).toBeInTheDocument();
    });
  });

  // Error handling tests
  test("handles file upload errors gracefully", async () => {
    setup();
    fireEvent.click(screen.getByText("Upload"));

    const file = new File([""], "test.txt", { type: "text/plain" });
    const fileInput = screen.getByRole("button", { name: /drag and drop/i });

    Object.defineProperty(fileInput, "files", {
      value: [file],
    });

    fireEvent.drop(fileInput, {
      dataTransfer: {
        files: [file],
      },
    });

    await waitFor(() => {
      expect(screen.getByText(/test.txt/i)).toBeInTheDocument();
    });
  });

  // Drag and drop tests
  test("handles drag and drop states correctly", async () => {
    setup();
    fireEvent.click(screen.getByText("Upload"));
    const dropZone = screen.getByText(/drag and drop/i).parentElement;

    fireEvent.dragEnter(dropZone);
    expect(dropZone).toHaveClass("drag-active");

    fireEvent.dragLeave(dropZone);
    expect(dropZone).not.toHaveClass("drag-active");
  });
});
