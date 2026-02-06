// backend/src/users/users.controller.ts
import { Body, Controller, Patch, Req, UseGuards, BadRequestException } from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { UpdateMeDto } from "./dto/update-me.dto";

@Controller("users")
export class UsersController {
    constructor(private readonly users: UsersService) {}

    @UseGuards(JwtAuthGuard)
    @Patch("me")
    async updateMe(@Req() req: any, @Body() dto: UpdateMeDto) {
        if (!dto.newUsername && !dto.newPassword) {
            throw new BadRequestException("Nothing to update");
        }

        const userId = req.user.userId;
        return this.users.updateMe(userId, dto);
    }
}
