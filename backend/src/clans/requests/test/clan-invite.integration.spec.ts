// backend/src/clans/requests/test/clan-invite.integration.spec.ts
// npx jest clan-invite.integration.spec.ts --runInBand

import request from "supertest";
import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import { AppModule } from "../../../app.module";
import { UsersBuilderService } from "../../../users/users-builder.service";
import { createTestJwt } from "../../../helpers/auth.helper";

import { ClansBuilderService } from "../../builders/clans.builder.service";
import { ClanManagementService } from "../../management/clan-management.service";
import { ClanRequestRepository } from "../clan-requests.repository";
import {UsersService} from "../../../users/users.service";

describe("Clan invite (integration) /clans/invite", () => {
    let app: INestApplication;
    let usersBuilderService: UsersBuilderService;
    let usersService: UsersService;
    let clansBuilderService: ClansBuilderService;
    let clanManagementService: ClanManagementService;
    let clanRequestRepository: ClanRequestRepository;
    let jwtService: JwtService;

    const createdUserIds = new Set<string>();
    const createdClanIds = new Set<string>();

    beforeAll(async () => {
        const modRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = modRef.createNestApplication();
        await app.init();

        usersBuilderService = modRef.get(UsersBuilderService);
        clansBuilderService = modRef.get(ClansBuilderService);
        clanManagementService = modRef.get(ClanManagementService);
        clanRequestRepository = modRef.get(ClanRequestRepository);
        usersService = modRef.get(UsersService);
        jwtService = modRef.get(JwtService);
    });

    afterEach(async () => {
        for (const clanId of createdClanIds) {
            await clanManagementService.deleteClanById(clanId);
        }

        for (const userId of createdUserIds) {
            await usersService.deleteUserById(userId);
        }

        createdClanIds.clear();
        createdUserIds.clear();
    });

    afterAll(async () => {
        await app.close();
    });

    function rememberUserId(userId: string) {
        createdUserIds.add(userId);
        return userId;
    }

    function rememberClanId(clanId: string) {
        createdClanIds.add(clanId);
        return clanId;
    }


    async function createTrackedUser() {
        const user = await usersBuilderService.createTestUser();
        rememberUserId(String(user._id));
        return user;
    }

    async function createClanActorContext() {
        const owner = await createTrackedUser();

        const clan = await clansBuilderService.createTestClan({
            ownerUserId: String(owner._id),
        });

        rememberClanId(clan.id);

        const token = createTestJwt({
            userId: String(owner._id),
            jwtService,
        });

        return {
            owner,
            clan,
            token,
        };
    }

    it("POST /clans/invite without token -> 401", async () => {
        const targetUser = await createTrackedUser();

        const res = await request(app.getHttpServer())
            .post("/clans/invite")
            .send({
                userId: String(targetUser._id),
            });

        expect(res.status).toBe(401);
    });

    it("POST /clans/invite -> owner should invite a user", async () => {
        const { owner, clan, token } = await createClanActorContext();
        const target = await createTrackedUser();

        const res = await request(app.getHttpServer())
            .post("/clans/invite")
            .set({ Authorization: `Bearer ${token}` })
            .send({
                userId: String(target._id),
            });

        expect(res.status).toBe(201);

        expect(res.body).toMatchObject({
            requestId: expect.any(String),
            status: "PENDING",
            autoAccepted: false,
        });

        const saved = await clanRequestRepository.findById(res.body.requestId);

        expect(saved).toBeTruthy();
        expect(String(saved!._id)).toBe(res.body.requestId);
        expect(String(saved!.clanId)).toBe(clan.id);
        expect(String(saved!.userId)).toBe(String(target._id));
        expect(String(saved!.createdByUserId)).toBe(String(owner._id));
        expect(saved!.type).toBe("INVITE");
        expect(saved!.status).toBe("PENDING");
    });

    it("POST /clans/invite -> repeated invite should not duplicate", async () => {
        const { clan, token } = await createClanActorContext();
        const target = await createTrackedUser();

        const first = await request(app.getHttpServer())
            .post("/clans/invite")
            .set({ Authorization: `Bearer ${token}` })
            .send({
                userId: String(target._id),
            });

        expect(first.status).toBe(201);

        const second = await request(app.getHttpServer())
            .post("/clans/invite")
            .set({ Authorization: `Bearer ${token}` })
            .send({
                userId: String(target._id),
            });

        expect(second.status).toBe(201);

        expect(second.body).toMatchObject({
            requestId: first.body.requestId,
            status: "PENDING",
            autoAccepted: false,
        });

        const saved = await clanRequestRepository.findById(first.body.requestId);

        expect(saved).toBeTruthy();
        expect(String(saved!.clanId)).toBe(clan.id);
        expect(String(saved!.userId)).toBe(String(target._id));
        expect(saved!.type).toBe("INVITE");
        expect(saved!.status).toBe("PENDING");
    });
});