import { Injectable } from "@nestjs/common";
import { ClanManagementService } from "../management/clan-management.service";
import { ClansBuilderFactory } from "./clans.builder.factory";
import { CreateClanBuilderOverrides } from "./clans.builder.types";

@Injectable()
export class ClansBuilderService {
    constructor(
        private readonly clanManagementService: ClanManagementService,
        private readonly clansBuilderFactory: ClansBuilderFactory,
    ) {}

    async createTestClan(overrides: CreateClanBuilderOverrides) {
        const input = this.clansBuilderFactory.buildCreateClanInput(overrides);

        return this.clanManagementService.createClan(input.ownerUserId, {
            name: input.name,
            slug: input.slug,
        });
    }
}