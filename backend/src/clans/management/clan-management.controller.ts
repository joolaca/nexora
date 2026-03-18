// backend/src/clans/management/clan-management.controller.ts
import { Body, Controller, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { CreateClanDto } from "./dto/create-clan.dto";
import { EditClanDto } from "./dto/edit-clan.dto";
import { ClanManagementService } from "./clan-management.service";

@UseGuards(JwtAuthGuard)
@Controller("clans")
export class ClanManagementController {
    constructor(private readonly clanManagementService: ClanManagementService) {}

    @Post()
    create(@Req() req: any, @Body() dto: CreateClanDto) {
        return this.clanManagementService.createClan(req.user.userId, dto);
    }

    @Patch()
    update(@Req() req: any, @Body() dto: EditClanDto) {
        return this.clanManagementService.editClan(req.user.userId, dto);
    }
}