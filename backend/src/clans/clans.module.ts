// backend/src/clans/clans.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Clan, ClanSchema } from "./clan.schema";
import { ClansController } from "./clans.controller";
import { ClansService } from "./clans.service";
import { ClansRepository } from "./clans.repository";

@Module({
    imports: [MongooseModule.forFeature([{ name: Clan.name, schema: ClanSchema }])],
    controllers: [ClansController],
    providers: [ClansService, ClansRepository],
    exports: [ClansService],
})
export class ClansModule {}
