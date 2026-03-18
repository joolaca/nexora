import { ClanRole } from "../core/clans.schema";

export type CreateClanDbParams = {
    name: string;
    slug: string;
    ownerUserId: string;
    roles: ClanRole[];
};