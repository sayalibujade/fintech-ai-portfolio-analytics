export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface SignupRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}

export interface SignupResponse {
    message: string;
    user: User;
}