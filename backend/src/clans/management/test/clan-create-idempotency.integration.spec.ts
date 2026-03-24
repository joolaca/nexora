// npx jest clan-create-idempotency.integration.spec.ts --runInBand

import request from "supertest";
import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import { AppModule } from "../../../app.module";
import { UsersBuilderService } from "../../../users/users-builder.service";
import { UsersService } from "../../../users/users.service";
import { UsersRepository } from "../../../users/users.repository";
import { createTestJwt } from "../../../helpers/auth.helper";

import { ClanManagementService } from "../clan-management.service";
import { ClanManagementRepository } from "../clan-management.repository";

describe("Clan create idempotency (integration) /clans", () => {
    let app: INestApplication;
    let usersBuilderService: UsersBuilderService;
    let usersService: UsersService;
    let usersRepository: UsersRepository;
    let clanManagementService: ClanManagementService;
    let clanManagementRepository: ClanManagementRepository;
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
        usersService = modRef.get(UsersService);
        usersRepository = modRef.get(UsersRepository);
        clanManagementService = modRef.get(ClanManagementService);
        clanManagementRepository = modRef.get(ClanManagementRepository);
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

    async function createActorContext() {
        const user = await createTrackedUser();

        const token = createTestJwt({
            userId: String(user._id),
            jwtService,
        });

        return {
            user,
            token,
        };
    }

    it("POST /clans without token -> 401", async () => {
        const res = await request(app.getHttpServer())
            .post("/clans")
            .send({
                name: "Night Owls",
                slug: "night-owls",
            });

        expect(res.status).toBe(401);
    });

    it("POST /clans with idempotency key -> should create clan", async () => {
        const { user, token } = await createActorContext();
        const idempotencyKey = "clan-create:test-create-1";

        const res = await request(app.getHttpServer())
            .post("/clans")
            .set({ Authorization: `Bearer ${token}` })
            .set({ "Idempotency-Key": idempotencyKey })
            .send({
                name: "Night Owls",
                slug: "night-owls",
            });

        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({
            id: expect.any(String),
            name: "Night Owls",
            slug: "night-owls",
            myRole: "owner",
        });

        rememberClanId(res.body.id);

        const savedClan = await clanManagementRepository.findById(res.body.id);

        expect(savedClan).toBeTruthy();
        expect(String(savedClan!._id)).toBe(res.body.id);
        expect(savedClan!.name).toBe("Night Owls");
        expect(savedClan!.slug).toBe("night-owls");
        expect(savedClan!.requestId).toBe(idempotencyKey);
        expect(String(savedClan!.createdByUserId)).toBe(String(user._id));

        expect(savedClan!.members).toHaveLength(1);
        expect(String(savedClan!.members[0].userId)).toBe(String(user._id));
        expect(savedClan!.members[0].roleKey).toBe("owner");

        const reloadedUser = await usersRepository.findById(String(user._id));
        expect(reloadedUser).toBeTruthy();
        expect(String(reloadedUser!.clanId)).toBe(res.body.id);
    });

    it("POST /clans with same idempotency key -> should return same clan and not create duplicate", async () => {
        const { user, token } = await createActorContext();
        const idempotencyKey = "clan-create:test-same-key-1";

        const first = await request(app.getHttpServer())
            .post("/clans")
            .set({ Authorization: `Bearer ${token}` })
            .set({ "Idempotency-Key": idempotencyKey })
            .send({
                name: "Night Owls",
                slug: "night-owls",
            });

        expect(first.status).toBe(201);
        expect(first.body).toMatchObject({
            id: expect.any(String),
            name: "Night Owls",
            slug: "night-owls",
            myRole: "owner",
        });

        rememberClanId(first.body.id);

        const second = await request(app.getHttpServer())
            .post("/clans")
            .set({ Authorization: `Bearer ${token}` })
            .set({ "Idempotency-Key": idempotencyKey })
            .send({
                name: "Totally Different Name",
                slug: "totally-different-slug",
            });

        expect(second.status).toBe(201);
        expect(second.body).toEqual(first.body);

        const savedClan = await clanManagementRepository.findById(first.body.id);

        expect(savedClan).toBeTruthy();
        expect(savedClan!.name).toBe("Night Owls");
        expect(savedClan!.slug).toBe("night-owls");
        expect(savedClan!.requestId).toBe(idempotencyKey);
        expect(String(savedClan!.createdByUserId)).toBe(String(user._id));

        const reloadedUser = await usersRepository.findById(String(user._id));
        expect(reloadedUser).toBeTruthy();
        expect(String(reloadedUser!.clanId)).toBe(first.body.id);
    });

    it("POST /clans with different idempotency key after user already joined a clan -> 409 USER_ALREADY_IN_CLAN", async () => {
        const { token } = await createActorContext();

        const first = await request(app.getHttpServer())
            .post("/clans")
            .set({ Authorization: `Bearer ${token}` })
            .set({ "Idempotency-Key": "clan-create:first-key" })
            .send({
                name: "Night Owls",
                slug: "night-owls",
            });

        expect(first.status).toBe(201);

        rememberClanId(first.body.id);

        const second = await request(app.getHttpServer())
            .post("/clans")
            .set({ Authorization: `Bearer ${token}` })
            .set({ "Idempotency-Key": "clan-create:second-key" })
            .send({
                name: "Sun Wolves",
                slug: "sun-wolves",
            });

        expect(second.status).toBe(409);
        console.log(`--🔍--!! second.body ` , second.body );
        expect(second.status).toBe(409);
        expect(second.body?.error?.errorCode).toBe("USER_ALREADY_IN_CLAN");
    });
});