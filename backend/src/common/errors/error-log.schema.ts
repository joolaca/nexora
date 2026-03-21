import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";

export type ErrorLogDocument = HydratedDocument<ErrorLog>;

@Schema({
    timestamps: true,
    versionKey: false,
    collection: "error_logs",
})
export class ErrorLog {
    @Prop({ required: true, index: true })
    statusCode!: number;

    @Prop({ type: String, default: null, index: true })
    errorCode!: string | null;

    @Prop({ required: true })
    message!: string;

    @Prop({ type: String, default: null, index: true })
    name!: string | null;

    @Prop({ type: String, default: null, index: true })
    severity!: string | null;

    @Prop({ type: String, default: null, index: true })
    kind!: string | null;

    @Prop({ type: String, default: null, index: true })
    domain!: string | null;

    @Prop({ type: Boolean, default: false, index: true })
    shouldPersist!: boolean;

    @Prop({ type: String, default: null })
    path!: string | null;

    @Prop({ type: String, default: null })
    method!: string | null;

    @Prop({ type: String, default: null, index: true })
    actorUserId!: string | null;

    @Prop({ type: SchemaTypes.Mixed, default: {} })
    params!: Record<string, any>;

    @Prop({ type: SchemaTypes.Mixed, default: null })
    requestBody!: Record<string, any> | null;

    @Prop({ type: SchemaTypes.Mixed, default: {} })
    context!: Record<string, any>;

    @Prop({ type: String, default: null })
    stack!: string | null;

    @Prop({ type: String, default: null, index: true })
    environment!: string | null;

}

export const ErrorLogSchema = SchemaFactory.createForClass(ErrorLog);