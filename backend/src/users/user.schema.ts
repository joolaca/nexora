import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

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
}


export const UserSchema = SchemaFactory.createForClass(User);
