import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const AUTH_SECRET = process.env.AUTH_SECRET;
const COOKIE_NAME = "expense_diary_token";
const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

if (!AUTH_SECRET) {
  throw new Error(
    "Missing AUTH_SECRET environment variable. Add it to your .env.local file."
  );
}

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
}

export function signToken(payload: SessionPayload): string {
  return jwt.sign(payload, AUTH_SECRET as string, {
    expiresIn: TOKEN_MAX_AGE_SECONDS,
  });
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, AUTH_SECRET as string) as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Reads and verifies the session cookie on the server (Server Components,
 * Route Handlers, Server Actions). Returns null if unauthenticated.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function setSessionCookie(payload: SessionPayload) {
  const token = signToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TOKEN_MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export const AUTH_COOKIE_NAME = COOKIE_NAME;

/* ------------------------------------------------------------------ */
/* Pending session (between password check and OTP verification)      */
/* ------------------------------------------------------------------ */

const PENDING_COOKIE_NAME = "expense_diary_pending";
const PENDING_MAX_AGE_SECONDS = 60 * 15; // 15 minutes - generous but bounded

export interface PendingPayload {
  userId: string;
  purpose: "email_verification" | "login";
}

export async function setPendingCookie(payload: PendingPayload) {
  const token = jwt.sign(payload, AUTH_SECRET as string, {
    expiresIn: PENDING_MAX_AGE_SECONDS,
  });
  const cookieStore = await cookies();
  cookieStore.set(PENDING_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: PENDING_MAX_AGE_SECONDS,
  });
}

export async function getPendingSession(): Promise<PendingPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(PENDING_COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, AUTH_SECRET as string) as PendingPayload;
  } catch {
    return null;
  }
}

export async function clearPendingCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(PENDING_COOKIE_NAME);
}
