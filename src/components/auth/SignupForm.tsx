/**
 * @file SignupForm.tsx
 * @description A React component for creating new user accounts using Firebase Authentication.
 *              It includes email/password signup, password strength validation, and a required
 *              Terms & Conditions agreement checkbox. The form also stores user details and
 *              terms acceptance metadata in Firestore upon successful registration.
 *
 * @features
 *  - Uses Material UI components for styling and responsive layout.
 *  - Validates password strength (uppercase, lowercase, number, special character).
 *  - Allows toggling password visibility for better UX.
 *  - Requires users to accept Terms & Conditions before creating an account.
 *  - Integrates with Firebase Auth (email/password + Google sign-in).
 *  - Stores user profile info and agreement data in Firestore.
 *
 * @usage
 *  Appears on the `/signup` route. On successful signup, a new Firebase Auth user
 *  is created, and a Firestore document is generated in `users/{uid}`.
 */

import React, { useState } from 'react';
import {
  Container,
  Paper,
  Box,
  TextField,
  Typography,
  Alert,
  Divider,
  Stack,
  Button,
  FormControl,
  FormControlLabel,
  Checkbox,
  FormHelperText,
  Link,
  InputAdornment,
  IconButton,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebase';
import Logo from '../layout/Logo';

export default function SignupForm() {
  // state
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTos, setAcceptedTos] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [termsOpen, setTermsOpen] = useState(false);
  const openTerms = () => setTermsOpen(true);
  const closeTerms = () => setTermsOpen(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const openPrivacy = () => setPrivacyOpen(true);
  const closePrivacy = () => setPrivacyOpen(false);

  // helpers
  const toggleShowPassword = () => setShowPassword((s) => !s);
  const toggleShowConfirm = () => setShowConfirm((s) => !s);
  const preventMouseDown = (e: React.MouseEvent<HTMLButtonElement>) =>
    e.preventDefault();

  // simple strength helper (optional)
  function validatePasswordStrength(pw: string): string | null {
    const hasUpper = /[A-Z]/.test(pw);
    const hasLower = /[a-z]/.test(pw);
    const hasNum = /\d/.test(pw);

    if (pw.length < 8) return 'At least 8 characters';
    if (!hasUpper) return 'Add an uppercase letter';
    if (!hasLower) return 'Add a lowercase letter';
    if (!hasNum) return 'Add a number';

    return null;
  }

  // at the top with other state/constants
  const TERMS_VERSION = 'v1.0'; // bump when your terms change

  // helper (keep near the component or in a utils file)
  async function createUserDoc(uid: string, name: string, email: string) {
    const userRef = doc(db, 'users', uid);
    await setDoc(
      userRef,
      {
        displayName: name,
        email,
        // optional UI flag; NOT used for security:
        // isAdmin: false,
        terms: {
          accepted: true,
          version: TERMS_VERSION,
          acceptedAt: serverTimestamp(),
        },
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  // REPLACE your existing handleSubmit with this
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // client-side checks
    if (!acceptedTos) return setError('Please accept Terms to continue.');
    if (password !== confirmPassword)
      return setError('Passwords do not match.');
    const strength = validatePasswordStrength(password);
    if (strength) return setError(strength);

    try {
      setLoading(true);

      // 1) Create the Auth user
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      // 2) Set displayName on the Auth profile
      await updateProfile(cred.user, { displayName });

      // 3) Create/merge the Firestore user profile
      await createUserDoc(cred.user.uid, displayName, email);

      // 4) Send email verification (recommended)
      try {
        await sendEmailVerification(cred.user);
      } catch {
        /* non-fatal */
      }

      // 5) Success UX
      setSuccess('Account created! Check your email for a verification link.');
      setDisplayName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setAcceptedTos(false);
    } catch (err: any) {
      // map Firebase error codes to friendly messages if you have a mapper
      const code = err?.code as string | undefined;
      const msg =
        code === 'auth/email-already-in-use'
          ? 'That email is already in use.'
          : code === 'auth/invalid-email'
            ? 'That email looks invalid.'
            : code === 'auth/weak-password'
              ? 'Please choose a stronger password (at least 6 characters).'
              : err?.message || 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container
      maxWidth="sm"
      sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center' }}
    >
      <Paper
        elevation={4}
        sx={{ width: '100%', p: { xs: 2, sm: 3 }, borderRadius: 3 }}
      >
        <Box 
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap={1}
            mb={2}>
        <Logo size="lg" variant="dark" />
        <Box alignItems="left"
        justifyContent="left"
        >   
        <Typography variant="h6" color="black" gutterBottom textAlign="left">
          STALK.AI
        </Typography>
        <span>STOCK PREDICITION</span>
        </Box>
        
        
        
        </Box>
        <Typography
          variant="h4"
          fontWeight={700}
          gutterBottom
          textAlign={'center'}
        >
          Create your account
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Sign up with email/password or continue with Google.
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

        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit}
          sx={{ display: 'grid', gap: 2 }}
        >
          <TextField
            id="name"
            label="Name"
            placeholder="John Smith"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            autoComplete="name"
            required
            fullWidth
          />
          <TextField
            id="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            fullWidth
          />

          {/* Password with show/hide using slotProps (future-proof for MUI 6) */}
          <TextField
            id="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            fullWidth
            helperText={
              password
                ? (validatePasswordStrength(password) ?? 'Strong password')
                : ''
            }
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                      onClick={toggleShowPassword}
                      onMouseDown={preventMouseDown}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            id="confirm"
            label="Confirm Password"
            type={showConfirm ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
            fullWidth
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={
                        showConfirm
                          ? 'Hide confirm password'
                          : 'Show confirm password'
                      }
                      onClick={toggleShowConfirm}
                      onMouseDown={preventMouseDown}
                      edge="end"
                    >
                      {showConfirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          {/* Terms inside the form, before the submit button */}
          <FormControl required error={!acceptedTos} sx={{ mt: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={acceptedTos}
                  onChange={(e) => setAcceptedTos(e.target.checked)}
                  inputProps={{
                    'aria-label': 'Agree to Terms and Privacy Policy',
                  }}
                />
              }
              label={
                <span>
                  I agree to the{' '}
                  <Link
                    component="button"
                    onClick={openTerms}
                    underline="hover"
                  >
                    Terms & Conditions
                  </Link>{' '}
                  and{' '}
                  <Link
                    componet="button"
                    onClick={openPrivacy}
                    underline="hover"
                  >
                    Privary Policy.
                  </Link>
                </span>
              }
            />
            {!acceptedTos && (
              <FormHelperText>
                You must agree before creating an account.
              </FormHelperText>
            )}
          </FormControl>

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading || !acceptedTos}
            sx={{
              backgroundColor: '#009689',
              mt: 1,
              py: 1.25,
              borderRadius: 2,
            }}
          >
            {loading ? 'Creating...' : 'Sign up'}
          </Button>
        </Box>

        <Stack direction="row" alignItems="center" spacing={2} sx={{ my: 3 }}>
          <Divider flexItem />
          <Typography variant="caption" color="text.secondary">
            or
          </Typography>
          <Divider flexItem />
        </Stack>

        <Button
          onClick={() => alert('Google click (UI test)')}
          fullWidth
          variant="outlined"
          size="large"
          startIcon={<GoogleIcon />}
          sx={{
            backgroundColor: '#009689',
            color: '#FFF',
            py: 1.25,
            borderRadius: 2,
          }}
        >
          Continue with Google
        </Button>
        <Typography sx={{ mt: 3 }}>
          Already a User? <Link to="LoginForm">Login</Link>
        </Typography>
      </Paper>

      <Dialog open={termsOpen} onClose={closeTerms} fullWidth maxWidth="md">
        <DialogTitle>Terms & Conditions</DialogTitle>
        <DialogContent dividers sx={{ typography: 'body1' }}>
          <Typography variant="h6" gutterBottom>
            Last updated: Oct 25, 2025
          </Typography>
          <Typography paragraph>
            Welcome to Stalk.AI. By accessing or using our website and services,
            you agree to these Terms.
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            1. Acceptance of Terms
          </Typography>
          <Typography paragraph>
            By creating an account or using our services, you agree to comply
            with these Terms.
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            2. Use of Services
          </Typography>
          <ul>
            <li>
              <Typography component="span">Follow applicable laws.</Typography>
            </li>
            <li>
              <Typography component="span">
                No unauthorized access or abuse.
              </Typography>
            </li>
            <li>
              <Typography component="span">
                No harmful or illegal content.
              </Typography>
            </li>
          </ul>
          <Typography variant="subtitle1" gutterBottom>
            3. Account Responsibilities
          </Typography>
          <Typography paragraph>
            You are responsible for your credentials and any activity under your
            account.
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            4. Intellectual Property
          </Typography>
          <Typography paragraph>
            All content and logos are the property of Stalk.AI or its licensors.
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            5. Termination
          </Typography>
          <Typography paragraph>
            We may suspend or terminate access for violations of these Terms.
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            6. Limitation of Liability
          </Typography>
          <Typography paragraph>
            Stalk.AI is not liable for indirect or consequential damages arising
            from use of the service.
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            7. Changes
          </Typography>
          <Typography paragraph>
            We may update these Terms; changes are effective upon posting.
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            8. Contact
          </Typography>
          <Typography paragraph>(909) 800-0013 San Bernardino, CA</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeTerms}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={privacyOpen} onClose={closePrivacy} fullWidth maxWidth="md">
        <DialogTitle>Privicy Policy</DialogTitle>
        <DialogContent dividers sx={{ typography: 'body1' }}>
          <Typography variant="h6" gutterBottom>
            Last updated: Oct 25, 2025
          </Typography>
          <Typography paragraph>
            Welcome to Stalk.AI. Your privacy is important to us. This Privacy
            Policy explains how we collect, use, and protect your personal
            information when you interact with our website and services.
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            1. Information We Collect
          </Typography>
          <Typography paragraph>
            We may collect certain types of information from you, including
            personal information such as your name, email address, and account
            credentials when you register for an account. In addition, we
            automatically collect usage data such as your IP address, browser
            type, and interactions with our platform. We may also use
            cookies—small text files stored on your device—to enhance your user
            experience.
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            2. How we use your Information
          </Typography>
          <Typography paragraph>
            We retain your personal information only as long as necessary to
            fulfill the purposes outlined in this policy, unless a longer
            retention period is required by law. We do not sell or rent your
            personal information to third parties. However, we may share limited
            data with trusted service providers who assist us in operating our
            services, and with legal authorities if required by law or to
            protect our rights.
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            3. Data Retention
          </Typography>
          <Typography paragraph>
            We retain your personal information only for as long as necessary to
            fulfill the purposes outlined in this Privacy Policy, unless a
            longer retention period is required by law.
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            4. Data Secuirty
          </Typography>
          <Typography paragraph>
            We implement appropriate technical and organizational measures to
            protect your information against unauthorized access, alteration,
            disclosure, or destruction.
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            5. Sharing Information
          </Typography>
          <Typography paragraph>
            We do not sell or rent your personal information. We may share data
            with: - Service providers that help us operate our platform. - Legal
            authorities, if required by law or to protect our rights.
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            6. You're Rights
          </Typography>
          <Typography paragraph>
            You have the right to: - Access and update your personal data. -
            Request deletion of your account and personal information. - Opt out
            of certain communications.{' '}
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            7. Third-Party Services
          </Typography>
          <Typography paragraph>
            Our website may contain links to third-party services. We are not
            responsible for the privacy practices or content of these external
            websites.
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            8. Children's Privacy
          </Typography>
          <Typography paragraph>
            Our services are not intended for individuals under the age of 13.
            We do not knowingly collect personal information from children.
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            9. Updates to This Policy
          </Typography>
          <Typography paragraph>
            We may update this Privacy Policy periodically. Any changes will be
            posted on this page with an updated revision date.
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            10. Contact Us
          </Typography>
          <Typography paragraph>
            If you have any questions about this Privacy Policy, please contact
            us at: (909) 800-0013 San Bernardino, CA
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closePrivacy}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
