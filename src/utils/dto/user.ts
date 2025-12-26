export interface User {
  id: string;
  email: string;
  name: string;
  accessLevel: string;
  image: string;
  phone: string;
  status: string;
  createdAt: string;
}

export interface UserState {
  userInfo: User | null;
  isAuthenticated: boolean;
  token?: string | null;
}
