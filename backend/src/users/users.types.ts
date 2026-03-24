import { UserRole } from "./user-role.enum";

export type CreateUserInput = {
    username: string;
    plainPassword: string;
    rank?: number;
    about?: string;
};

export type CreateUserOverrides = Partial<CreateUserInput> & {
    role?: UserRole;
};

export type CreateUserDbParams = {
    username: string;
    passwordHash: string;
    role?: UserRole;
    rank?: number;
    about?: string;
};