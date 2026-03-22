import { ApiProperty } from "@nestjs/swagger";

export class UserPublicDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    username!: string;

    @ApiProperty()
    rank!: number;

    @ApiProperty()
    about!: string;
}