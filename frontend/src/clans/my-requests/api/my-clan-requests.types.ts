export type MyClanInviteClan = {
    id: string;
    name: string;
    description: string | null;
    ownerUserId: string | null;
    memberCount: number | null;
};

export type MyClanInviteListItem = {
    requestId: string;
    clanId: string;
    userId: string;
    createdByUserId: string;

    type: "INVITE";
    status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";

    createdAt: string;

    clan: MyClanInviteClan;
};