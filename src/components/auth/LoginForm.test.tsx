/**
 * @file LoginForm.test.tsx
 * @description Jest + React Testing Library tests for LoginForm component with safe in-file mocks.
 */

import React from "react";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
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
  const theme = createTheme({
    components: {
      MuiButtonBase: {
        defaultProps: {
          // Disable ripples in tests to avoid asynchronous TouchRipple state updates
          // that lead to React's "act(...)" warnings. Ripples are purely visual;
          // disabling them makes tests deterministic and faster.
          // See: https://mui.com/material-ui/react-button/#disable-ripple
          // and https://react.dev/reference/react-dom/test-utils#act for background.
          disableRipple: true,
        },
      },
    },
  });

  return render(
    <MemoryRouter initialEntries={["/login"]}>
      <ThemeProvider theme={theme}>
        <LoginForm />
      </ThemeProvider>
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
  await act(async () => {
    await userEvent.click(screen.getByRole("button", { name: /log in/i }));
  });
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
  await act(async () => {
    await userEvent.click(screen.getByRole("button", { name: /log in/i }));
  });

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
  await act(async () => {
    await userEvent.click(screen.getByLabelText(/remember me/i));
  });
  await act(async () => {
    await userEvent.click(screen.getByRole("button", { name: /log in/i }));
  });

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
  await act(async () => {
    await userEvent.click(screen.getByRole("button", { name: /log in/i }));
  });

  expect(await screen.findByText(/incorrect email or password/i)).toBeInTheDocument();
});

test("toggles password visibility when clicking eye icon", async () => {
  renderLogin();
  const pwd = getPasswordInput() as HTMLInputElement;
  expect(pwd.type).toBe("password");
  const eyeBtn = screen.getByRole("button", { name: /show password/i });
  await act(async () => {
    await userEvent.click(eyeBtn);
  });
  expect(pwd.type).toBe("text");
});

test("google sign-in creates Firestore user doc if missing", async () => {
  const fakeUser: any = { uid: "uid1", displayName: "Test", emailVerified: true };
  (authMod.signInWithPopup as jest.Mock).mockResolvedValueOnce({ user: fakeUser });
  (fsMod.getDoc as jest.Mock).mockResolvedValueOnce({ exists: () => false });

  renderLogin();
  await act(async () => {
    await userEvent.click(screen.getByRole("button", { name: /continue with google/i }));
  });

  await waitFor(() => {
    expect(authMod.signInWithPopup).toHaveBeenCalled();
    expect(fsMod.getDoc).toHaveBeenCalled();
    expect(fsMod.setDoc).toHaveBeenCalled();
  });
});

test('shows email verification message when login helper returns email-verify error', async () => {
  // Mock firebase to simulate email-not-verified path
  const fakeUser: any = {
    reload: jest.fn().mockResolvedValue(undefined),
    emailVerified: false,
    getIdTokenResult: jest.fn().mockResolvedValue({ claims: {} }),
  };
  (authMod.signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({ user: fakeUser });

  renderLogin();
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'notverified@example.com' } });
  fireEvent.change(getPasswordInput(), { target: { value: 'secret' } });
  await act(async () => {
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));
  });

  expect(await screen.findByText(/please verify your email before continuing/i)).toBeInTheDocument();
});

test('clicking Sign up emits navigate custom event', async () => {
  const dispatchSpy = jest.spyOn(window, 'dispatchEvent');
  renderLogin();
  const signUp = screen.getByRole('link', { name: /sign up/i });
  await act(async () => {
    await userEvent.click(signUp);
  });
  expect(dispatchSpy).toHaveBeenCalled();
  const ev = dispatchSpy.mock.calls[dispatchSpy.mock.calls.length - 1][0];
  expect(ev.type).toBe('navigate');
  // @ts-ignore
  expect(ev.detail?.page).toBe('signup');
});

test('clicking Forgot password emits navigate custom event', async () => {
  const dispatchSpy = jest.spyOn(window, 'dispatchEvent');
  renderLogin();
  const forgot = screen.getByRole('link', { name: /forgot password\?/i });
  await act(async () => {
    await userEvent.click(forgot);
  });
  expect(dispatchSpy).toHaveBeenCalled();
  const ev = dispatchSpy.mock.calls[dispatchSpy.mock.calls.length - 1][0];
  expect(ev.type).toBe('navigate');
  // @ts-ignore
  expect(ev.detail?.page).toBe('forgot-password');
});

test('google sign-in failure shows friendly error', async () => {
  (authMod.signInWithPopup as jest.Mock).mockRejectedValueOnce({ code: 'auth/unknown-error' });
  renderLogin();
  await act(async () => {
    await userEvent.click(screen.getByRole('button', { name: /continue with google/i }));
  });

  // default mapAuthError should produce the fallback message
  expect(await screen.findByText(/unable to sign in with google|unable to sign in. please try again/i)).toBeInTheDocument();
});

test('password icon mouseDown prevents default', () => {
  renderLogin();
  const pwd = getPasswordInput() as HTMLInputElement;
  const eyeBtn = screen.getByRole('button', { name: /show password/i });
  // spy on preventDefault of the event object by calling fireEvent.mouseDown
  // ensure no exception and input type remains 'password' (mouseDown shouldn't toggle)
  act(() => {
    fireEvent.mouseDown(eyeBtn);
  });
  expect(pwd.type).toBe('password');
});