export enum HTTP_METHODS {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE",
    PATCH = "PATCH",
}

export type ApiConfig = {
    method: HTTP_METHODS;
    endPoint: string;
    isAuth?: boolean;
};

export const AUTH_CONFIG = {
    LOGIN: (): ApiConfig => ({
        method: HTTP_METHODS.POST,
        endPoint: "api/auth/login",
    }),
    SIGNUP: (): ApiConfig => ({
        method: HTTP_METHODS.POST,
        endPoint: "api/auth/signup",
    }),
};
