import { IsMongoId } from "class-validator";

export class InviteToClanDto {
    @IsMongoId()
    userId!: string;
}
