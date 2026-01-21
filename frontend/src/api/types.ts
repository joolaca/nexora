export type ApiMeta = { timestamp?: string };

export type ApiSuccess<T> = {
    data: T;
    meta?: ApiMeta;
};

export type ApiErrorBody = {
    statusCode: number;
    message: string | string[];
    path?: string;
    method?: string;
    name?: string;
    thrownAt?: string;
    stack?: string;
};

export type ApiFailure = {
    data: null;
    error: ApiErrorBody;
    meta?: ApiMeta;
};

export class ApiError extends Error {
    statusCode: number;
    body?: ApiFailure;

    constructor(message: string, statusCode: number, body?: ApiFailure) {
        super(message);
        this.name = "ApiError";
        this.statusCode = statusCode;
        this.body = body;
    }
}
