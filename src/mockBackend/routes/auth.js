import * as authService from '../services/authService';

export async function postLogin(body) {
  return authService.mockLogin(body);
}

export async function getMe() {
  return authService.mockMe();
}

export async function postLogout() {
  return authService.mockLogout();
}
