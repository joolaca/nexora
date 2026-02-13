import { IsString, MaxLength, MinLength, Matches, IsOptional } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateClanDto {
    @ApiProperty({ example: "Clan 1", description: "Clan display name." })
    @IsString()
    @MinLength(3)
    @MaxLength(32)
    name!: string;

    @ApiPropertyOptional({
        example: "clan-1",
        description: "Optional URL-friendly slug. If omitted, it will be generated from the name.",
    })
    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(32)
    @Matches(/^[a-z0-9-]+$/i, { message: "slug can contain letters, numbers, dash" })
    slug?: string;
}
