import { API_V1_URL } from './config';

function formatApiError(data: unknown, fallback: string): string {
  if (data && typeof data === 'object' && 'message' in data) {
    const m = (data as { message: unknown }).message;
    if (Array.isArray(m)) return m.join(', ');
    if (typeof m === 'string') return m;
  }
  return fallback;
}

const AUTH_HEADERS = (token: string) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
});

export type RegisterCredentials = {
  email: string;
  password: string;
  name?: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type ForgotPasswordResponse = {
  message: string;
  resetToken?: string;
};

export type ResetPasswordInput = {
  token: string;
  password: string;
};

export type AuthResponse = {
  accessToken: string;
  user: { id: string; email: string; name?: string };
};

export async function register(
  credentials: RegisterCredentials,
): Promise<AuthResponse> {
  const res = await fetch(`${API_V1_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: credentials.email?.trim().toLowerCase(),
      password: credentials.password,
      name: credentials.name?.trim() || undefined,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      formatApiError(data, `Request failed (${res.status})`),
    );
  }

  return data as AuthResponse;
}

export async function login(
  credentials: LoginCredentials,
): Promise<AuthResponse> {
  const res = await fetch(`${API_V1_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: credentials.email?.trim().toLowerCase(),
      password: credentials.password,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      formatApiError(data, `Request failed (${res.status})`),
    );
  }

  return data as AuthResponse;
}

export async function forgotPassword(
  email: string,
): Promise<ForgotPasswordResponse> {
  const res = await fetch(`${API_V1_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email?.trim().toLowerCase() }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      formatApiError(data, `Request failed (${res.status})`),
    );
  }

  return data as ForgotPasswordResponse;
}

export async function resetPassword(
  input: ResetPasswordInput,
): Promise<{ message: string }> {
  const res = await fetch(`${API_V1_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: input.token.trim(),
      password: input.password,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      formatApiError(data, `Request failed (${res.status})`),
    );
  }

  return data as { message: string };
}

export type User = { id: string; email: string; name?: string };

export async function getCurrentUser(accessToken: string): Promise<{ user: User }> {
  const res = await fetch(`${API_V1_URL}/me`, {
    method: 'GET',
    headers: AUTH_HEADERS(accessToken),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      formatApiError(data, `Request failed (${res.status})`),
    );
  }

  return data as { user: User };
}

export type UpdateAccountInput = { name?: string; email?: string };

export async function updateAccount(
  accessToken: string,
  input: UpdateAccountInput,
): Promise<{ user: User }> {
  const res = await fetch(`${API_V1_URL}/me`, {
    method: 'PATCH',
    headers: AUTH_HEADERS(accessToken),
    body: JSON.stringify({
      name: input.name?.trim() || undefined,
      email: input.email?.trim().toLowerCase() || undefined,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      formatApiError(data, `Request failed (${res.status})`),
    );
  }

  return data as { user: User };
}
