import { IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateMeDto {
    @ApiProperty({
        example: "currentPassword123",
        description: "Current password (required to authorize the change).",
    })
    @IsString()
    @MinLength(1)
    currentPassword!: string;

    @ApiPropertyOptional({
        example: "new_username",
        description: "New username (optional).",
    })
    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(32)
    @Matches(/^[a-z0-9._-]+$/i, {
        message: "username can contain letters, numbers, dot, underscore, dash",
    })
    newUsername?: string;

    @ApiPropertyOptional({
        example: "newSecret123",
        description: "New password (optional).",
    })
    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(64)
    newPassword?: string;
}
