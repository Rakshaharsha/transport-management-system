// Mock Auth Utilities

export type UserRole = 'admin' | 'driver' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

const MOCK_USERS: User[] = [
{ id: '1', name: 'Admin User', email: 'admin@transport.com', role: 'admin' },
{
  id: '2',
  name: 'John Driver',
  email: 'driver@transport.com',
  role: 'driver'
},
{
  id: '3',
  name: 'Alice Student',
  email: 'student@transport.com',
  role: 'user'
}];


export const login = async (
email: string)
: Promise<{user: User;token: string;}> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const user = MOCK_USERS.find((u) => u.email === email);

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const token = `mock-jwt-token-${user.id}-${Date.now()}`;
  localStorage.setItem('transport_token', token);
  localStorage.setItem('transport_user', JSON.stringify(user));

  return { user, token };
};

export const logout = () => {
  localStorage.removeItem('transport_token');
  localStorage.removeItem('transport_user');
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('transport_user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('transport_token');
};