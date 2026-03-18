// backend/src/users/users.types.ts

export type CreateUserInput = {
    username: string;
    plainPassword: string;
    rank?: number;
    about?: string;
};

export type CreateUserOverrides = Partial<CreateUserInput>;


export type CreateUserDbParams = {
    username: string;
    passwordHash: string;
    rank?: number;
    about?: string;
};