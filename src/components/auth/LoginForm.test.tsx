import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginForm from "./LoginForm";
import { BrowserRouter } from "react-router-dom";

const renderLoginForm = () =>
  render(
    <BrowserRouter>
      <LoginForm />
    </BrowserRouter>
  );

describe("LoginForm", () => {
  test("renders email and password input fields", () => {
    renderLoginForm();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    // Use getByLabelText with a selector to ensure we only get the input
    const passwordInput = screen.getByLabelText(/password/i, {
      selector: 'input',
    });
    expect(passwordInput).toBeInTheDocument();
  });

  test("renders Remember Me checkbox and navigation links", () => {
    renderLoginForm();
    expect(screen.getByRole("checkbox", { name: /remember me/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /forgot password/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign up/i })).toBeInTheDocument();
  });

  test("toggles password visibility when icon is clicked", () => {
    renderLoginForm();
    const toggleBtn = screen.getByLabelText(/show password/i);
    const passwordField = screen.getByLabelText(/password/i, { selector: 'input' });

    expect(passwordField).toHaveAttribute("type", "password");
    fireEvent.click(toggleBtn);
    expect(passwordField).toHaveAttribute("type", "text");
    fireEvent.click(toggleBtn);
    expect(passwordField).toHaveAttribute("type", "password");
  });

  test("shows error message if login fails", async () => {
    renderLoginForm();

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i, { selector: 'input' }), {
      target: { value: "wrongpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });

  test("navigates to dashboard on successful login", async () => {
    renderLoginForm();

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i, { selector: 'input' }), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    });
  });

  test("allows Google sign-in button to be clicked", async () => {
    renderLoginForm();
    const googleBtn = screen.getByRole("button", { name: /continue with google/i });
    fireEvent.click(googleBtn);

    await waitFor(() => {
      expect(screen.getByText(/signed in successfully/i)).toBeInTheDocument();
    });
  });
});
