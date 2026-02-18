
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types  } from "mongoose";

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, versionKey: false })
export class User {
    @Prop({
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        index: true,
        minlength: 3,
        maxlength: 32,
    })
    username!: string;

    @Prop({ required: true })
    password!: string;

    @Prop({ required: true, min: 0, default: 0, index: true })
    rank!: number;

    @Prop({ type: Types.ObjectId, ref: "Clan", default: null, index: true })
    clanId!: Types.ObjectId | null;

}


export const UsersSchema = SchemaFactory.createForClass(User);
