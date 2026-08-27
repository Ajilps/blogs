"use server";

import { redirect } from "next/navigation";
import {
  adminIsConfigured,
  createAdminSession,
  deleteAdminSession,
  validateAdminCredentials,
} from "@/lib/auth";
import {
  clearLoginFailures,
  loginIsAllowed,
  recordLoginFailure,
} from "@/lib/login-rate-limit";

export type LoginState = { error?: string };

export async function loginAction(
  _state: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") || "").slice(0, 254);
  const password = String(formData.get("password") || "").slice(0, 256);

  if (!adminIsConfigured()) {
    return { error: "Admin access is not configured yet." };
  }

  if (!(await loginIsAllowed())) {
    return { error: "Too many sign-in attempts. Please wait 15 minutes and try again." };
  }

  if (!validateAdminCredentials(email, password)) {
    await recordLoginFailure();
    return { error: "Email or password is incorrect." };
  }

  await clearLoginFailures();
  await createAdminSession();
  redirect("/admin");
}

export async function logoutAction() {
  await deleteAdminSession();
  redirect("/admin/login");
}
