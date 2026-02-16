// src/clan/requests/api/requests.types.ts

export type ClanRequestType = "INVITE" | "APPLY";

// backendben: CANCELLED, a korábbi frontban: CANCELED
export type ClanRequestStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED" | "CANCELED";

export type ClanRequestListItem = {
    requestId: string;
    clanId: string;
    type: ClanRequestType;
    status: ClanRequestStatus;
    createdAt: string;
};

// INVITE (clan -> user)
export type ClanInviteRequest = {
    userId: string;
};

export type ClanInviteResponse = {
    requestId: string;
    status: "PENDING" | "ACCEPTED";
    autoAccepted: boolean;
};
