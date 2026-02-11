import { Transform } from "class-transformer";
import { IsIn, IsInt, IsOptional, Max, Min } from "class-validator";

export class ListUsersDto {
    @IsOptional()
    @Transform(({ value }) => Number(value))
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number;

    @IsOptional()
    @Transform(({ value }) => Number(value))
    @IsInt()
    @Min(1)
    page?: number;

    @IsOptional()
    @IsIn(["rank_desc", "rank_asc", "username_asc", "username_desc"])
    sort?: "rank_desc" | "rank_asc" | "username_asc" | "username_desc";

    @IsOptional()
    @Transform(({ value }) => Number(value))
    @IsInt()
    @Min(0)
    minRank?: number;

    @IsOptional()
    @Transform(({ value }) => Number(value))
    @IsInt()
    @Min(0)
    maxRank?: number;

    @IsOptional()
    @IsIn(["any", "in", "none"])
    clan?: "any" | "in" | "none";
}
