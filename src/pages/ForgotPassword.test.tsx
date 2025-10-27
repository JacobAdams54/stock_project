import React from "react";
// Add jest-dom matchers so TypeScript recognizes extended matchers like
// toBeInTheDocument and toHaveTextContent in this test file.
import "@testing-library/jest-dom";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ForgotPasswordPage from "./ForgotPassword";
import * as firebaseAuth from "firebase/auth";

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
}));

const mocked = firebaseAuth as unknown as {
  getAuth: jest.Mock;
  sendPasswordResetEmail: jest.Mock;
};

describe("ForgotPassword page", () => {
  beforeEach(() => {
    mocked.getAuth.mockClear();
    mocked.sendPasswordResetEmail.mockClear();
  });

  test("submits email and shows confirmation on success", async () => {
    mocked.sendPasswordResetEmail.mockResolvedValue(undefined);

    render(<ForgotPasswordPage />);

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

    render(<ForgotPasswordPage />);

    const input = screen.getByLabelText(/email/i) as HTMLInputElement;
    await userEvent.type(input, "notfound@example.com");
    const submit = screen.getByRole("button", { name: /send reset link/i });
    await userEvent.click(submit);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/no account found for this email/i);
    });
  });

  test("dispatches navigation events for Back to login and Back to home", async () => {
    // use a loose "any" for the event to avoid DOM typing issues in the test env
    const handler = jest.fn((e: any) => e);
    window.addEventListener("navigate", handler);

    // Non-submitted: Back to login
    render(<ForgotPasswordPage />);
    const backToLogin = screen.getByRole("button", { name: /back to login/i });
    await userEvent.click(backToLogin);
    expect(handler).toHaveBeenCalled();
    const ev = handler.mock.calls[0][0] as CustomEvent;
    expect(ev.detail).toEqual({ to: "login" });

  // Submitted: Back to home — cleanup previous render then render a fresh instance
  cleanup();
  mocked.sendPasswordResetEmail.mockResolvedValue(undefined);
  render(<ForgotPasswordPage />);
    const input = screen.getByLabelText(/email/i) as HTMLInputElement;
    await userEvent.type(input, "someone@example.com");
    const submit = screen.getByRole("button", { name: /send reset link/i });
    await userEvent.click(submit);

    await waitFor(() => expect(screen.getByText(/check your email/i)).toBeInTheDocument());

    const backToHome = screen.getByRole("button", { name: /back to home/i });
    await userEvent.click(backToHome);
    // second call
    expect(handler).toHaveBeenCalledTimes(2);
    const ev2 = handler.mock.calls[1][0] as CustomEvent;
    expect(ev2.detail).toEqual({ to: "home" });

    window.removeEventListener("navigate", handler);
  });
});
