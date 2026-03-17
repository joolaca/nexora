import { SetMetadata } from "@nestjs/common";
import { ClanPermission } from "../roles/clan-roles.permissions";

export const CLAN_PERMISSION_KEY = "clanPermission";

export const RequireClanPermission = (permission: ClanPermission) =>
    SetMetadata(CLAN_PERMISSION_KEY, permission);