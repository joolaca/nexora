import { IsMongoId } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class InviteToClanDto {
    @ApiProperty({ example: "65f2c1b2a3c4d5e6f7a8b9c0", description: "Target user ID (Mongo ObjectId)." })
    @IsMongoId()
    userId!: string;
}
