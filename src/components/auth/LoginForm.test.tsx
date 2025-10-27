/**
 * @file LoginForm.test.tsx
 * @description Jest + React Testing Library tests for LoginForm component with safe in-file mocks.
 */

import React from "react";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import LoginForm from "./LoginForm";

/* ------------------ Mocks ------------------ */
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return { ...actual, useNavigate: () => jest.fn() };
});

jest.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: jest.fn(),
  setPersistence: jest.fn(),
  browserLocalPersistence: { type: "local" },
  browserSessionPersistence: { type: "session" },
  GoogleAuthProvider: function GoogleAuthProvider() {},
  signInWithPopup: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  serverTimestamp: jest.fn(() => new Date()),
}));

jest.mock("../../firebase/firebase", () => ({ auth: {} as any, db: {} as any }));

const authMod = jest.requireMock("firebase/auth") as typeof import("firebase/auth");
const fsMod = jest.requireMock("firebase/firestore") as typeof import("firebase/firestore");

/* ------------------ Setup ------------------ */
afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={["/login"]}>
      <LoginForm />
    </MemoryRouter>
  );
}

const getPasswordInput = () =>
  screen.getByLabelText(/password/i, { selector: "input" });

/* ------------------ Tests ------------------ */
test("renders login form fields and buttons", () => {
  renderLogin();
  expect(screen.getByRole("heading", { name: /log in to your account/i })).toBeInTheDocument();
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  expect(getPasswordInput()).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /continue with google/i })).toBeInTheDocument();
});

test("shows validation message for empty form submit", async () => {
  renderLogin();
  fireEvent.click(screen.getByRole("button", { name: /log in/i }));
  expect(await screen.findByText(/please enter your email and password/i)).toBeInTheDocument();
});

test("performs successful login using session persistence by default", async () => {
  const fakeUser: any = {
    emailVerified: true,
    reload: jest.fn().mockResolvedValue(undefined),
    getIdTokenResult: jest.fn().mockResolvedValue({ claims: {} }),
  };
  (authMod.signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({ user: fakeUser });

  renderLogin();
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "test@example.com" } });
  fireEvent.change(getPasswordInput(), { target: { value: "secret123" } });
  fireEvent.click(screen.getByRole("button", { name: /log in/i }));

  await waitFor(() => {
    expect(authMod.setPersistence).toHaveBeenCalled();
    const persistenceArg = (authMod.setPersistence as jest.Mock).mock.calls[0][1];
    expect(persistenceArg.type).toBe("session");
    expect(authMod.signInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      "test@example.com",
      "secret123"
    );
    expect(fakeUser.reload).toHaveBeenCalled();
  });
});

test("uses local persistence when Remember Me is checked", async () => {
  const fakeUser: any = {
    emailVerified: true,
    reload: jest.fn().mockResolvedValue(undefined),
    getIdTokenResult: jest.fn().mockResolvedValue({ claims: {} }),
  };
  (authMod.signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({ user: fakeUser });

  renderLogin();
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "test@example.com" } });
  fireEvent.change(getPasswordInput(), { target: { value: "secret123" } });
  fireEvent.click(screen.getByLabelText(/remember me/i));
  fireEvent.click(screen.getByRole("button", { name: /log in/i }));

  await waitFor(() => {
    const persistenceArg = (authMod.setPersistence as jest.Mock).mock.calls[0][1];
    expect(persistenceArg.type).toBe("local");
  });
});

test("shows error for wrong credentials", async () => {
  (authMod.signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce({
    code: "auth/wrong-password",
  });

  renderLogin();
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "bad@example.com" } });
  fireEvent.change(getPasswordInput(), { target: { value: "nope" } });
  fireEvent.click(screen.getByRole("button", { name: /log in/i }));

  expect(await screen.findByText(/incorrect email or password/i)).toBeInTheDocument();
});

test("toggles password visibility when clicking eye icon", () => {
  renderLogin();
  const pwd = getPasswordInput() as HTMLInputElement;
  expect(pwd.type).toBe("password");
  const eyeBtn = screen.getByRole("button", { name: /show password/i });
  fireEvent.click(eyeBtn);
  expect(pwd.type).toBe("text");
});

test("google sign-in creates Firestore user doc if missing", async () => {
  const fakeUser: any = { uid: "uid1", displayName: "Test", emailVerified: true };
  (authMod.signInWithPopup as jest.Mock).mockResolvedValueOnce({ user: fakeUser });
  (fsMod.getDoc as jest.Mock).mockResolvedValueOnce({ exists: () => false });

  renderLogin();
  fireEvent.click(screen.getByRole("button", { name: /continue with google/i }));

  await waitFor(() => {
    expect(authMod.signInWithPopup).toHaveBeenCalled();
    expect(fsMod.getDoc).toHaveBeenCalled();
    expect(fsMod.setDoc).toHaveBeenCalled();
  });
});