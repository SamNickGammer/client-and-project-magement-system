export interface User {
    id: string;
    email: string;
}

export interface UserState {
    userInfo: User | null;
    isAuthenticated: boolean;
    token?: string | null;
}