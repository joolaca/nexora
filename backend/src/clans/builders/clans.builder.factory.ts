// backend/src/clans/builders/clans.builder.factory.ts
import { Injectable } from "@nestjs/common";
import {
    CreateClanBuilderInput,
    CreateClanBuilderOverrides,
} from "./clans.builder.types";

@Injectable()
export class ClansBuilderFactory {
    private sequence = 0;

    private nextSequence() {
        this.sequence += 1;
        return this.sequence;
    }

    private generateName() {
        const seq = this.nextSequence();
        return `Test Clan ${Date.now()} ${seq}`;
    }

    buildCreateClanInput(
        overrides: CreateClanBuilderOverrides,
    ): CreateClanBuilderInput {
        return {
            ownerUserId: overrides.ownerUserId,
            name: overrides.name ?? this.generateName(),
            slug: overrides.slug,
        };
    }
}