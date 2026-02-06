// backend/src/users/dto/update-me.dto.ts
import { IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class UpdateMeDto {
    @IsString()
    @MinLength(1)
    currentPassword!: string;

    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(32)
    @Matches(/^[a-z0-9._-]+$/i, {
        message: "username can contain letters, numbers, dot, underscore, dash",
    })
    newUsername?: string;

    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(64)
    newPassword?: string;
}
