/**
 * ForgotPassword Page
 *
 * This page allows users to request a password reset email.
 * It integrates with Firebase Auth's `sendPasswordResetEmail` to trigger
 * the reset flow, and exposes navigation events for the app shell.
 *
 * Placement
 * - Location: `src/pages/ForgotPassword.tsx` because this is a top-level route page
 *   (pages are placed under `src/pages/` following the project convention).
 *
 * Contract
 * - Inputs: none (email is entered by user)
 * - Outputs: dispatches custom `navigate` events on navigation button clicks
 * - Side effects: calls Firebase `sendPasswordResetEmail` and updates local UI state
 *
 * States
 * - email: string — bound to the email input
 * - isSubmitted: boolean — whether the reset email was successfully requested
 * - error: string | null — friendly error message to display
 *
 * Error handling
 * - Common Firebase errors (invalid-email, user-not-found) are mapped to
 *   user-friendly messages shown inline. Other errors fallback to the error message.
 *
 * Notes
 * - This implementation uses Material-UI (MUI) components for layout, inputs, and buttons,
 *   providing a consistent, accessible, and easily testable UI. All form elements and layout
 *   are built using MUI's `Container`, `Paper`, `Box`, `TextField`, `Button`, and related components.
 */

import React, { useState } from "react";
import {
	Container,
	Paper,
	Box,
	TextField,
	Typography,
	Alert,
	Button,
	Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import Logo from "../components/layout/Logo";

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState("");
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const auth = getAuth();

	const mapFirebaseError = (code: string | undefined, message: string) => {
		if (!code) return message;
		if (code.includes("invalid-email")) return "Please enter a valid email address.";
		if (code.includes("user-not-found"))
			return "No account found for this email. Please check and try again.";
		return message;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		try {
			await sendPasswordResetEmail(auth, email);
			setIsSubmitted(true);
		} catch (err: any) {
			const friendly = mapFirebaseError(err?.code, err?.message ?? "Failed to send reset email.");
			setError(friendly);
		}
	};

	const navigate = useNavigate();

	return (
		<Container maxWidth="sm" sx={{ minHeight: "100dvh", display: "grid", placeItems: "center" }}>
			<Paper elevation={4} sx={{ width: "100%", p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
				<Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={2}>
					<Logo size="lg" variant="dark" />
					<Box alignItems="flex-start" justifyContent="flex-start">
						<Typography variant="h6" color="black" gutterBottom textAlign="left">
							STALK.AI
						</Typography>
						<span>STOCK PREDICTION</span>
					</Box>
				</Box>

				{!isSubmitted ? (
					<Box component="form" noValidate onSubmit={handleSubmit} sx={{ display: "grid", gap: 2 }}>
						<Typography variant="h4" fontWeight={700} gutterBottom textAlign="center">
							Reset your password
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Enter the email associated with your account.
						</Typography>

						{error && (
							<Alert severity="error" sx={{ mt: 1 }}>
								{error}
							</Alert>
						)}

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

						<Stack direction="row" spacing={2} alignItems="center">
							<Button type="submit" variant="contained" size="large" sx={{ backgroundColor: "#009689" }}>
								Send reset link
							</Button>

							<Button type="button" variant="text" onClick={() => navigate("/login") }>
								Back to login
							</Button>
						</Stack>
					</Box>
				) : (
					<Box sx={{ textAlign: "center", display: "grid", gap: 2 }}>
						<Typography variant="h5" fontWeight={700}>
							Check your email
						</Typography>
						<Typography variant="body2" color="text.secondary">
							We've sent a password reset link to <strong>{email}</strong> if an account exists.
						</Typography>

						<Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
							<Button
								variant="outlined"
								onClick={() => {
									setIsSubmitted(false);
									setError(null);
									setEmail("");
								}}
							>
								Try a different email
							</Button>

							<Button variant="contained" color="inherit" onClick={() => navigate("/login") }>
								Back to login
							</Button>

							<Button variant="outlined" onClick={() => navigate("/") }>
								Back to home
							</Button>
						</Stack>
					</Box>
				)}
			</Paper>
		</Container>
	);
}

