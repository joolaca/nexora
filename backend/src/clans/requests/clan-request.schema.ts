// backend/src/clans/join/clan-join-request.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type ClanRequestDocument = HydratedDocument<ClanRequest>;

export type ClanRequestType = "INVITE" | "APPLY";
export type ClanRequestStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";

@Schema({ timestamps: true, versionKey: false, collection: "clan_requests" })
export class ClanRequest {
    @Prop({ type: Types.ObjectId, required: true, index: true })
    clanId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({ required: true, enum: ["INVITE", "APPLY"], index: true })
    type!: ClanRequestType;

    @Prop({ required: true, enum: ["PENDING", "ACCEPTED", "REJECTED", "CANCELLED"], default: "PENDING", index: true })
    status!: ClanRequestStatus;

    @Prop({ type: Types.ObjectId, required: true })
    createdByUserId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, default: null })
    decidedByUserId!: Types.ObjectId | null;

    @Prop({ type: Date, default: null })
    decidedAt!: Date | null;
}

export const ClanRequestSchema = SchemaFactory.createForClass(ClanRequest);

ClanRequestSchema.index(
    { clanId: 1, userId: 1 },
    { unique: true, partialFilterExpression: { status: "PENDING" } }
);
