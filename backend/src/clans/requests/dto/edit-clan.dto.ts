import { IsString, MaxLength, MinLength, Matches, IsOptional } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class EditClanDto {
    @ApiPropertyOptional({ example: "New Clan Name", description: "New clans name." })
    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(32)
    name?: string;

    @ApiPropertyOptional({ example: "new-clans-slug", description: "New slug (URL-friendly)." })
    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(32)
    @Matches(/^[a-z0-9-]+$/i, { message: "slug can contain letters, numbers, dash" })
    slug?: string;
}
