// backend/src/users/tests/auth.login.integration.spec.ts
// npx jest auth.login.integration.spec.ts --runInBand

import request from "supertest";
import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { AppModule } from "../../app.module";
import { UsersFixtureService } from "../../users/users-fixture.service";

describe("Auth (integration) /auth/login", () => {
    let app: INestApplication;
    let usersFixtureService: UsersFixtureService;

    const createdUserIds: string[] = [];

    beforeAll(async () => {
        const modRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = modRef.createNestApplication();
        await app.init();

        usersFixtureService = modRef.get(UsersFixtureService);
    });

    afterEach(async () => {
        for (const userId of createdUserIds.splice(0)) {
            await usersFixtureService.deleteUserById(userId);
        }
    });

    afterAll(async () => {
        await app.close();
    });

    it("POST /auth/login -> should login with a valid username and password", async () => {
        const plainPassword = "secret123"
        const createdUser = await usersFixtureService.createTestUser({
            username: "login_test_user_1",
            plainPassword: plainPassword,
        });

        createdUserIds.push(createdUser.id);

        const res = await request(app.getHttpServer())
            .post("/auth/login")
            .send({
                username: createdUser.username,
                password: plainPassword,
            });

        expect([200, 201]).toContain(res.status);

        expect(res.body).toEqual(
            expect.objectContaining({
                token: expect.any(String),
                user: expect.objectContaining({
                    id: createdUser.id,
                    username: createdUser.username,
                }),
            }),
        );

        expect(res.body.token.length).toBeGreaterThan(10);
    });

    it("POST /auth/login -> should return error if password is wrong", async () => {
        const createdUser = await usersFixtureService.createTestUser({
            username: `login_wrong_pw_${Date.now()}`,
            plainPassword: "123",
        });

        createdUserIds.push(createdUser.id);

        const res = await request(app.getHttpServer())
            .post("/auth/login")
            .send({
                username: createdUser.username,
                password: "rossz-jelszo",
            });

        expect(res.status).toBe(409);

    });
});