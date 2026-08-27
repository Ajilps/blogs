import "server-only";

import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";

const SESSION_COOKIE = "ajil_admin_session";
const SESSION_DURATION = 60 * 60 * 24 * 7;

function getAdminEmail() {
  return (process.env.ADMIN_EMAIL || "iamajil.tech@gmail.com").trim().toLowerCase();
}

function getSessionKey() {
  const secret = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD;
  return secret ? new TextEncoder().encode(secret) : null;
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function adminIsConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD && getSessionKey());
}

export function validateAdminCredentials(email: string, password: string) {
  const configuredPassword = process.env.ADMIN_PASSWORD;

  if (!configuredPassword || !getSessionKey()) return false;

  return (
    safeEqual(email.trim().toLowerCase(), getAdminEmail()) &&
    safeEqual(password, configuredPassword)
  );
}

export async function createAdminSession() {
  const key = getSessionKey();
  if (!key) throw new Error("Admin session secret is not configured.");

  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("admin")
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(key);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION,
    path: "/",
  });
}

export async function isAdmin() {
  const key = getSessionKey();
  if (!key) return false;

  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return false;

  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    return payload.sub === "admin" && payload.role === "admin";
  } catch {
    return false;
  }
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}

export async function deleteAdminSession() {
  (await cookies()).delete(SESSION_COOKIE);
}
