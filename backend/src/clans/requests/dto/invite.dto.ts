// backend/src/clans/join/dto/invite.dto.ts
import { IsMongoId } from "class-validator";

export class InviteToClanDto {
    @IsMongoId()
    userId!: string;
}
