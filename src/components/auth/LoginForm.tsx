/**
 * @file LoginForm.tsx
 * @description
 * The LoginForm component provides a secure user interface for logging into the application.
 * It integrates with Firebase Authentication to validate user credentials, display validation
 * errors, and redirect users to the dashboard on successful login.
 *
 * Features:
 *  - Email and password input fields
 *  - Password visibility toggle
 *  - Remember Me checkbox
 *  - Forgot Password and Sign Up navigation links
 *  - Integration with Firebase Auth using signInWithEmailAndPassword
 *  - Material UI + Tailwind for consistent design
 *
 * @module Components/LoginForm
 * @requires firebase/auth
 * @requires @mui/material
 */

/* eslint-disable react-refresh/only-export-components */

import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase";
import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Container,
  Paper,
  Box,
  TextField,
  Typography,
  Alert,
  Stack,
  Button,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  IconButton,
  Link,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import GoogleIcon from "@mui/icons-material/Google";
import Logo from "../layout/Logo";

/**
 * Map Firebase Auth error codes to friendly user-facing messages.
 * @param {string} [code] - Firebase auth error code (e.g. 'auth/wrong-password')
 * @returns {string} Localized, user-readable error message.
 */
function mapAuthError(code?: string): string {
  switch (code) {
    case "auth/invalid-email":
      return "Invalid email address.";
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Incorrect email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Try again later.";
    default:
      return "Unable to sign in. Please try again.";
  }
}

/**
 * Attempt to sign a user in with email/password and return a normalized result.
 * - Sets persistence based on `remember`.
 * - Verifies email is confirmed.
 * - Reads custom claims and Firestore profile when available.
 *
 * @param {{email: string, password: string, remember: boolean}} params
 * @returns {Promise<Object>} Object with shape { ok: boolean, error?: string, uid?: string, email?: string, displayName?: string, isAdmin?: boolean, profile?: any }
 */
export async function login({
  email,
  password,
  remember, // boolean from a checkbox
}: { email: string; password: string; remember: boolean }) {
  try {
    // 1) Choose persistence (remember me)
    await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);

    // 2) Auth login
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const user = cred.user;

    // 3) (Optional) require email verification
    await user.reload();
    if (!user.emailVerified) {
      return { ok: false, error: "Please verify your email before continuing." };
    }

    // 4) (Optional) get custom claims (e.g., admin)
    const token = await user.getIdTokenResult(true); // force refresh
    const isAdmin = !!token.claims.admin;

    // 5) (Optional) fetch Firestore profile for UI
    const snap = await getDoc(doc(db, "users", user.uid));
    const profile = snap.exists() ? snap.data() : null;

    // 6) Done – return what your app needs
    return {
      ok: true,
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      isAdmin,
      profile, // e.g., { displayName, terms, ... }
    };
  } catch (err: any) {
    return { ok: false, error: mapAuthError(err?.code) };
  }
}

/**
 * LoginForm component
 * Renders the email/password form, handles validation, and performs
 * authentication (email/password + Google) using Firebase.
 *
 * Emits a `CustomEvent('navigate', { detail: { page } })` prior to
 * react-router navigation to allow event-driven listeners.
 *
 * @returns {React.ReactElement} The login form element.
 */
export default function LoginForm(): React.ReactElement {
  // form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const navigate = useNavigate();

  function handleNavigation(page: 'home' | 'dashboard' | 'forgot-password' | 'signup') {
    try {
        window.dispatchEvent(new CustomEvent('navigate', { detail: { page } }));
      } catch {
        // ignore dispatch errors in older browsers or test env
      }
    const routeMap: Record<string, string> = {
      home: '/',
      dashboard: '/dashboard',
      'forgot-password': '/forgot-password',
      signup: '/signup',
    };
    const path = routeMap[page];
    if (path) navigate(path);
  }

  const toggleShowPassword = () => setShowPassword((s) => !s);
  const preventMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => e.preventDefault();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // ✅ Added validation check (matches test expectations)
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password");
      return;
    }

    setLoading(true);

    try {
      const res = await login({ email, password, remember });
      setLoading(false);

      if (!res.ok) {
        setError(res.error ?? "Unable to sign in");
        return;
      }

      setSuccess("Signed in successfully");
      setTimeout(() => {
        handleNavigation('dashboard');
      }, 400);
    } catch (err: any) {
      setLoading(false);
      setError(err?.message ?? "Unable to sign in");
    }
  }

  return (
    <Container
      maxWidth="sm"
      sx={{ minHeight: "100dvh", display: "grid", placeItems: "center" }}
    >
      <Paper elevation={4} sx={{ width: "100%", p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={2}>
          <Logo size="lg" variant="dark" />
          <Box alignItems="left" justifyContent="left">
            <Typography variant="h6" color="black" gutterBottom textAlign="left">
              STALK.AI
            </Typography>
            <span>STOCK PREDICTION</span>
          </Box>
        </Box>

        <Typography variant="h4" fontWeight={700} gutterBottom textAlign="center">
          Log in to your account
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Log in with email/password or continue with Google.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ display: "grid", gap: 2 }}>
          <TextField
            id="email"
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            fullWidth
          />

          <TextField
            id="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={toggleShowPassword}
                    onMouseDown={preventMouseDown}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <FormControlLabel
              control={<Checkbox checked={remember} onChange={(e) => setRemember(e.target.checked)} />}
              label="Remember me"
            />
            <Link
              component={RouterLink}
              to="/forgot-password"
              variant="body2"
              onClick={() => handleNavigation('forgot-password')}
            >
              Forgot password?
            </Link>
          </Stack>

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ backgroundColor: "#009689", mt: 1, py: 1.25, borderRadius: 2 }}
          >
            {loading ? "Signing in..." : "Log in"}
          </Button>
        </Box>

        <Button
          onClick={async () => {
            setError(null);
            setSuccess(null);
            setLoading(true);
            try {
              await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
              const provider = new GoogleAuthProvider();
              const cred = await signInWithPopup(auth, provider);
              const user = cred.user;

              const userRef = doc(db, "users", user.uid);
              const snap = await getDoc(userRef);
              if (!snap.exists()) {
                await setDoc(
                  userRef,
                  {
                    displayName: user.displayName ?? null,
                    isAdmin: false,
                    createdAt: serverTimestamp(),
                  },
                  { merge: true }
                );
              }

              setLoading(false);
              setSuccess("Signed in successfully");
              setTimeout(() => handleNavigation("dashboard"), 300);
            } catch (err: any) {
              setLoading(false);
              setError(mapAuthError(err?.code) || err?.message || "Unable to sign in with Google");
            }
          }}
          fullWidth
          variant="outlined"
          size="large"
          startIcon={<GoogleIcon />}
          sx={{ backgroundColor: "#009689", color: "#FFF", py: 1.25, borderRadius: 2, mt: 2 }}
        >
          Continue with Google
        </Button>
        <Box mt={2} textAlign="center">
          <Typography variant="body2">
            Don't have an account?{" "}
            <Link component={RouterLink} to="/signup" onClick={() => handleNavigation("signup")}>
              Sign up
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
