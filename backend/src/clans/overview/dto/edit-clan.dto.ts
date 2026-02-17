// backend/src/clans/dto/create-clan.dto.ts
import { IsString, MaxLength, MinLength, Matches, IsOptional } from "class-validator";

export class EditClanDto {
    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(32)
    name?: string;

    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(32)
    @Matches(/^[a-z0-9-]+$/i, { message: "slug can contain letters, numbers, dash" })
    slug?: string;
}
