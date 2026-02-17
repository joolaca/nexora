// backend/src/clans/clans.controller.ts
import { Body, Controller, Get, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { CreateClanDto } from "./dto/create-clan.dto";
import { EditClanDto } from "./dto/edit-clan.dto";
import { ClansService } from "./clan-overview.service";

@UseGuards(JwtAuthGuard)
@Controller("clans")
export class ClansController {
    constructor(private clans: ClansService) {}

    @Get("me")
    me(@Req() req: any) {
        return this.clans.getMyClan(req.user.userId);
    }

    @Post()
    create(@Req() req: any, @Body() dto: CreateClanDto) {
        return this.clans.createClan(req.user.userId, dto);
    }

    @Patch()
    update(@Req() req: any, @Body() dto: EditClanDto) {
        return this.clans.editClan(req.user.userId, dto);
    }
}
