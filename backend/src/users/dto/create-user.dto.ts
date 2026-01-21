import { IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CreateUserDto{
    @IsString()
    @MinLength(3)
    @MaxLength(32)
    @Matches(/^[a-z0-9._-]+$/i, {
        message: "username can contain letters, numbers, dot, underscore, dash",
    })
    username!:string;

    @IsString()
    @MinLength(3)
    @MaxLength(64)
    password!:string

}

