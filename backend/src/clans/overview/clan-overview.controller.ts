import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { ClanOverviewService } from "./clan-overview.service";

@UseGuards(JwtAuthGuard)
@Controller("clans")
export class ClansOverviewController {
    constructor(private readonly clanOverviewService: ClanOverviewService) {}

    @Get("me")
    me(@Req() req: any) {
        return this.clanOverviewService.getMyClan(req.user.userId);
    }
}