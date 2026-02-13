// backend/src/clans/join/clan-join-request.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type ClanJoinRequestDocument = HydratedDocument<ClanJoinRequest>;

export type ClanJoinRequestType = "INVITE" | "APPLY";
export type ClanJoinRequestStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";

@Schema({
    timestamps: true,
    versionKey: false,
    collection: "clan_join_requests",
})
export class ClanJoinRequest {
    @Prop({ type: Types.ObjectId, required: true, index: true })
    clanId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({ required: true, enum: ["INVITE", "APPLY"], index: true })
    type!: ClanJoinRequestType;

    @Prop({ required: true, enum: ["PENDING", "ACCEPTED", "REJECTED", "CANCELLED"], default: "PENDING", index: true })
    status!: ClanJoinRequestStatus;

    @Prop({ type: Types.ObjectId, required: true })
    createdByUserId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, default: null })
    decidedByUserId!: Types.ObjectId | null;

    @Prop({ type: Date, default: null })
    decidedAt!: Date | null;
}

export const ClanJoinRequestSchema = SchemaFactory.createForClass(ClanJoinRequest);

ClanJoinRequestSchema.index(
    { clanId: 1, userId: 1 },
    { unique: true, partialFilterExpression: { status: "PENDING" } }
);
