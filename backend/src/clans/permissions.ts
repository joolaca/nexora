// backend/src/clans/permissions.ts
export const ClanPermissions = {
    Edit: "clans.edit",
    WallWrite: "clans.wall.write",
    WallModerate: "clans.wall.moderate",
    RolesManage: "clans.roles.manage",
    MembersKick: "clans.members.kick",
} as const;

export type ClanPermission = (typeof ClanPermissions)[keyof typeof ClanPermissions];
