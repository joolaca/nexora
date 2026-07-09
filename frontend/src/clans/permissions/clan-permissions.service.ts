import {
    ClanPermission,
    ClanPermissions,
} from "./clan-permissions.constants";

type ClanPermissionSource = {
    permissions?: string[] | null;
} | null | undefined;

export function hasClanPermission(
    clan: ClanPermissionSource,
    permission: ClanPermission
): boolean {
    return clan?.permissions?.includes(permission) ?? false;
}

export function canManageClanRequests(clan: ClanPermissionSource): boolean {
    return hasClanPermission(clan, ClanPermissions.RequestsManage);
}

export function canEditClan(clan: ClanPermissionSource): boolean {
    return hasClanPermission(clan, ClanPermissions.Edit);
}

export function canManageClanRoles(clan: ClanPermissionSource): boolean {
    return hasClanPermission(clan, ClanPermissions.RolesManage);
}

export function canKickClanMembers(clan: ClanPermissionSource): boolean {
    return hasClanPermission(clan, ClanPermissions.MembersKick);
}