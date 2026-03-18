// backend/src/clans/builders/clans.builder.types.ts

export type CreateClanBuilderInput = {
    ownerUserId: string;
    name: string;
    slug?: string;
};

export type CreateClanBuilderOverrides = {
    ownerUserId: string;
    name?: string;
    slug?: string;
};