// src/clan/overview/api/overview.types.ts

export type ClanCreateRequest = {
    name: string;
    slug?: string;
};

export type ClanCreateResponse = {
    id: string;
    name: string;
    slug: string;
    myRole: string;
};

export type ClanEditRequest = {
    name?: string;
    slug?: string;
};

export type ClanEditResponse = {
    id: string;
    name: string;
    slug: string;
};

export type ClanMeResponse = {
    id: string;
    name: string;
    slug: string;
    myRole: string;
    permissions?: string[];
};
