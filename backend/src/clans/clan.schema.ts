// backend/src/clans/clan.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type ClanDocument = HydratedDocument<Clan>;

@Schema({ _id: false })
export class ClanRole {
    @Prop({ required: true }) key!: string;
    @Prop({ required: true }) name!: string;
    @Prop({ type: [String], default: [] }) permissions!: string[];
}

export const ClanRoleSchema = SchemaFactory.createForClass(ClanRole);

@Schema({ _id: false })
export class ClanMember {
    @Prop({ type: Types.ObjectId, required: true }) userId!: Types.ObjectId;
    @Prop({ required: true }) roleKey!: string;
    @Prop({ type: Date, default: Date.now }) joinedAt!: Date;
}

export const ClanMemberSchema = SchemaFactory.createForClass(ClanMember);

@Schema({ timestamps: true, versionKey: false })
export class Clan {
    @Prop({ required: true, trim: true, minlength: 3, maxlength: 32 })
    name!: string;

    @Prop({ required: true, trim: true, lowercase: true, unique: true, index: true })
    slug!: string;

    @Prop({ type: [ClanRoleSchema], default: [] })
    roles!: ClanRole[];

    @Prop({ type: [ClanMemberSchema], default: [] })
    members!: ClanMember[];
}

export const ClanSchema = SchemaFactory.createForClass(Clan);
