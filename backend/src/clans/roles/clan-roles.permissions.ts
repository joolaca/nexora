// backend/src/clans/permissions.ts
export const ClanPermissions = {
    Edit: "clan.edit",
    WallWrite: "clan.wall.write",
    WallModerate: "clan.wall.moderate",
    RolesManage: "clan.roles.manage",
    MembersKick: "clan.members.kick",
    RequestsManage: "clan.requests.manage",
} as const;

export type ClanPermission = (typeof ClanPermissions)[keyof typeof ClanPermissions];
