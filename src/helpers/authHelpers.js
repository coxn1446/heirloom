import * as authRoutes from '../mockBackend/routes/auth';

export async function loginWithUsername(username) {
  return authRoutes.postLogin({ username });
}

export async function fetchCurrentUser() {
  return authRoutes.getMe();
}

export async function logout() {
  return authRoutes.postLogout();
}
