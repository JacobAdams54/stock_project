import React from "react";
// Add jest-dom matchers so TypeScript recognizes extended matchers like
// toBeInTheDocument and toHaveTextContent in this test file.
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ForgotPasswordPage from "./ForgotPassword";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ButtonBase from "@mui/material/ButtonBase";

// Mock react-transition-group to avoid async mount/update behaviour coming
// from MUI's use of transitions in tests. Keeping this mock in the test file
// ensures it's scoped to this test only and doesn't modify global setup.
jest.mock("react-transition-group", () => ({
  CSSTransition: ({ children }: any) => children,
  TransitionGroup: ({ children }: any) => children,
  Transition: ({ children }: any) => children,
}));

// Keep firebase auth functions mocked locally in this test file.
jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
}));

const mocked = {
  getAuth: getAuth as unknown as jest.Mock,
  sendPasswordResetEmail: sendPasswordResetEmail as unknown as jest.Mock,
};

// Disable MUI ripple effects for this test file to avoid async ripple updates
// that can trigger "not wrapped in act" warnings in jsdom.
(ButtonBase as any).defaultProps = {
  disableRipple: true,
};

// Quiet noisy react / MUI act(...) warnings in this test file which are
// benign (they come from MUI internals). We still allow other console.error
// messages through so real errors are visible.
const _origConsoleError = console.error.bind(console);
console.error = (...args: any[]) => {
  try {
    const first = args[0];
    if (typeof first === "string" && first.includes("not wrapped in act")) {
      return;
    }
  } catch {
    // fall through to original
  }
  _origConsoleError(...args);
};

describe("ForgotPassword page", () => {
  beforeEach(() => {
    mocked.getAuth.mockClear();
    mocked.sendPasswordResetEmail.mockClear();
  });

  test("submits email and shows confirmation on success", async () => {
    mocked.sendPasswordResetEmail.mockResolvedValue(undefined);

  render(<ForgotPasswordPage />, { wrapper: MemoryRouter });

    const input = screen.getByLabelText(/email/i) as HTMLInputElement;
    await userEvent.type(input, "alice@example.com");

    const submit = screen.getByRole("button", { name: /send reset link/i });
    await userEvent.click(submit);

    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
      expect(screen.getByText(/alice@example.com/)).toBeInTheDocument();
    });
  });

  test("shows a friendly error when Firebase returns user-not-found", async () => {
    mocked.sendPasswordResetEmail.mockRejectedValue({ code: "auth/user-not-found", message: "User not found" });

    render(<ForgotPasswordPage />, { wrapper: MemoryRouter });

    const input = screen.getByLabelText(/email/i) as HTMLInputElement;
    await userEvent.type(input, "notfound@example.com");
    const submit = screen.getByRole("button", { name: /send reset link/i });
    await userEvent.click(submit);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/no account found for this email/i);
    });
  });

  test("navigates to login when Back to login is clicked (non-submitted)", async () => {
    render(
      <MemoryRouter initialEntries={["/forgot"]}>
        <>
          <ForgotPasswordPage />
          <Routes>
            <Route path="/login" element={<div>LOGIN PAGE</div>} />
          </Routes>
        </>
      </MemoryRouter>
    );

    const backToLogin = screen.getByRole("button", { name: /back to login/i });
    await userEvent.click(backToLogin);
    await waitFor(() => expect(screen.getByText(/LOGIN PAGE/i)).toBeInTheDocument());
  });

  test("navigates to home when Back to home is clicked after successful submit", async () => {
    // ensure sendPasswordResetEmail resolves for this flow
    mocked.sendPasswordResetEmail.mockResolvedValue(undefined);

    render(
      <MemoryRouter initialEntries={["/forgot"]}>
        <>
          <ForgotPasswordPage />
          <Routes>
            <Route path="/" element={<div>HOME PAGE</div>} />
          </Routes>
        </>
      </MemoryRouter>
    );

    const input = screen.getByLabelText(/email/i) as HTMLInputElement;
    await userEvent.type(input, "someone@example.com");
    const submit = screen.getByRole("button", { name: /send reset link/i });
    await userEvent.click(submit);

    await waitFor(() => expect(screen.getByText(/check your email/i)).toBeInTheDocument());

    const backToHome = screen.getByRole("button", { name: /back to home/i });
    await userEvent.click(backToHome);
    await waitFor(() => expect(screen.getByText(/HOME PAGE/i)).toBeInTheDocument());
  });
});
