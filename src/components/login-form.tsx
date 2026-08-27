"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/admin/actions";

const initialState: LoginState = {};

export function LoginForm({ configured }: { configured: boolean }) {
  const [state, action, pending] = useActionState(loginAction, initialState);

  return (
    <form className="login-form" action={action}>
      <div className="field-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue="iamajil.tech@gmail.com"
          autoComplete="username"
          required
        />
      </div>
      <div className="field-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      {!configured && (
        <p className="form-message form-error">
          Add ADMIN_PASSWORD and SESSION_SECRET to the environment before signing in.
        </p>
      )}
      {state.error && <p className="form-message form-error">{state.error}</p>}
      <button className="primary-button" type="submit" disabled={pending || !configured}>
        {pending ? "Signing in…" : "Enter the editor"}
      </button>
    </form>
  );
}
