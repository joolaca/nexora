import { Transform } from "class-transformer";
import { IsIn, IsInt, IsOptional, Max, Min } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class ListUsersDto {
    @ApiPropertyOptional({ example: 20, description: "Page size (1-100)." })
    @IsOptional()
    @Transform(({ value }) => Number(value))
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number;

    @ApiPropertyOptional({ example: 1, description: "Page number (>= 1)." })
    @IsOptional()
    @Transform(({ value }) => Number(value))
    @IsInt()
    @Min(1)
    page?: number;

    @ApiPropertyOptional({
        example: "rank_desc",
        description: "Sort order.",
        enum: ["rank_desc", "rank_asc", "username_asc", "username_desc"],
    })
    @IsOptional()
    @IsIn(["rank_desc", "rank_asc", "username_asc", "username_desc"])
    sort?: "rank_desc" | "rank_asc" | "username_asc" | "username_desc";

    @ApiPropertyOptional({ example: 0, description: "Minimum rank filter." })
    @IsOptional()
    @Transform(({ value }) => Number(value))
    @IsInt()
    @Min(0)
    minRank?: number;

    @ApiPropertyOptional({ example: 500, description: "Maximum rank filter." })
    @IsOptional()
    @Transform(({ value }) => Number(value))
    @IsInt()
    @Min(0)
    maxRank?: number;

    @ApiPropertyOptional({
        example: "any",
        description: 'Clan filter: "in" = has clans, "none" = no clans, "any" = no filter.',
        enum: ["any", "in", "none"],
    })
    @IsOptional()
    @IsIn(["any", "in", "none"])
    clan?: "any" | "in" | "none";
}
