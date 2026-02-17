import {ClanPermissions} from "./clan-roles.permissions";

export const BaseRoles = [
    {
        key: "owner",
        name: "Owner",
        permissions: [
            ClanPermissions.Edit,
            ClanPermissions.WallWrite,
            ClanPermissions.WallModerate,
            ClanPermissions.RolesManage,
            ClanPermissions.MembersKick,
        ],
    },
    {
        key: "admin",
        name: "Admin",
        permissions: [
            ClanPermissions.Edit,
            ClanPermissions.WallWrite,
            ClanPermissions.WallModerate,
        ],
    },
    {
        key: "member",
        name: "Member",
        permissions: [],
    },
]