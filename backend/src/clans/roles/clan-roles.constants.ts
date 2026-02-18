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
            ClanPermissions.RequestsManage,
        ],
    },
    {
        key: "admin",
        name: "Admin",
        permissions: [
            ClanPermissions.Edit,
            ClanPermissions.WallWrite,
            ClanPermissions.WallModerate,
            ClanPermissions.RequestsManage,
        ],
    },
    {
        key: "member",
        name: "Member",
        permissions: [],
    },
]