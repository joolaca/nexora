import { IsString, Matches, MaxLength, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
    @ApiProperty({
        example: "user123",
        description: "Username (letters, numbers, dot, underscore, dash).",
    })
    @IsString()
    @MinLength(3)
    @MaxLength(32)
    @Matches(/^[a-z0-9._-]+$/i, {
        message: "username can contain letters, numbers, dot, underscore, dash",
    })
    username!: string;

    @ApiProperty({
        example: "secret123",
        description: "Plain password (will be hashed on the server).",
    })
    @IsString()
    @MinLength(3)
    @MaxLength(64)
    password!: string;
}
