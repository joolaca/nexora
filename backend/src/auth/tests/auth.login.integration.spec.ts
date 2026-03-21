// backend/src/auth/tests/auth.login.integration.spec.ts
// npx jest auth.login.integration.spec.ts --runInBand

import request from "supertest";
import { INestApplication } from "@nestjs/common";
import { UsersBuilderService } from "../../users/users-builder.service";
import { UserRole } from "../../users/user-role.enum";
import { createTestApp } from "../../helpers/test-app.helper";

describe("Auth (integration) /auth/login", () => {
    let app: INestApplication;
    let usersFixtureService: UsersBuilderService;

    const createdUserIds: string[] = [];

    beforeAll(async () => {
        const testApp = await createTestApp();
        app = testApp.app;
        usersFixtureService = testApp.modRef.get(UsersBuilderService);
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
        const plainPassword = "secret123";
        const createdUser = await usersFixtureService.createTestUser({
            username: "login_test_user_" + Math.floor(Math.random() * 10000000000),
            plainPassword,
            role: UserRole.ADMIN,
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
