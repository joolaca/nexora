// backend/src/users/users.controller.ts
import { Body, Controller, Get, Patch, Query, Req, UseGuards, BadRequestException } from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { UpdateMeDto } from "./dto/update-me.dto";
import {ListUsersDto} from "./dto/list-users.dto";

@UseGuards(JwtAuthGuard)
@Controller("users")
export class UsersController {
    constructor(private readonly users: UsersService) {}


    @Patch("me")
    async updateMe(@Req() req: any, @Body() dto: UpdateMeDto) {
        if (!dto.newUsername && !dto.newPassword) {
            throw new BadRequestException("Nothing to update");
        }

        const userId = req.user.userId;
        return this.users.updateMe(userId, dto);
    }

    @Get()
    async list(@Query() q: ListUsersDto) {
        return this.users.listUsers({
            limit: q.limit,
            page: q.page,
            sort: q.sort,
            minRank: q.minRank,
            maxRank: q.maxRank,
            clan: q.clan,
        });
    }

}
