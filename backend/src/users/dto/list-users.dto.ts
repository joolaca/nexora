// backend/src/users/dto/list-users.dto.ts
import { Transform } from "class-transformer";
import { IsIn, IsInt, IsOptional, Max, Min } from "class-validator";

export class ListUsersDto {
    @IsOptional()
    @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number;

    @IsOptional()
    @IsIn(["rank_desc", "rank_asc", "username_asc", "username_desc"])
    sort?: "rank_desc" | "rank_asc" | "username_asc" | "username_desc";
}
