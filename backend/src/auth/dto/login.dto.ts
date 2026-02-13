import { IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
    @ApiProperty({
        example: "user23",
        description: "Username of the account.",
    })
    @IsString()
    username!: string;

    @ApiProperty({
        example: "secret123",
        description: "User password.",
    })
    @IsString()
    @MinLength(1)
    password!: string;
}
