// backend/src/internal/errors/tests/internal-errors-auth.integration.spec.ts
// npx jest internal-errors-auth.integration.spec.ts --runInBand

import request from "supertest";
import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { AppModule } from "../../../app.module";
import { UsersBuilderService } from "../../../users/users-builder.service";
import { UserRole } from "../../../users/user-role.enum";

describe("InternalErrors (integration) /internal/errors", () => {
    let app: INestApplication;
    let usersBuilderService: UsersBuilderService;

    const createdUserIds: string[] = [];

    beforeAll(async () => {
        const modRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = modRef.createNestApplication();
        await app.init();

        usersBuilderService = modRef.get(UsersBuilderService);
    });

    afterEach(async () => {
        for (const userId of createdUserIds.splice(0)) {
            await usersBuilderService.deleteUserById(userId);
        }
    });

    afterAll(async () => {
        await app.close();
    });

    async function loginAndGetToken(username: string, password: string) {
        const loginRes = await request(app.getHttpServer())
            .post("/auth/login")
            .send({
                username,
                password,
            });

        expect([200, 201]).toContain(loginRes.status);
        expect(loginRes.body).toEqual(
            expect.objectContaining({
                token: expect.any(String),
            }),
        );

        return loginRes.body.token;
    }

    it("GET /internal/errors/test without token -> 401", async () => {
        const res = await request(app.getHttpServer())
            .get("/internal/errors/test");

        expect(res.status).toBe(401);
    });

    it("GET /internal/errors/test with normal user token -> 403", async () => {
        const plainPassword = "secret123";
        const createdUser = await usersBuilderService.createTestUser({
            username: `internal_error_user_${Date.now()}`,
            plainPassword: plainPassword,
            role: UserRole.USER,
        });

        createdUserIds.push(createdUser.id);

        const token = await loginAndGetToken(createdUser.username, plainPassword);

        const res = await request(app.getHttpServer())
            .get("/internal/errors/test")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(403);
    });

    it("GET /internal/errors/test?type=app with admin token -> should reach controller and return 400", async () => {
        const plainPassword = "secret123";
        const createdAdmin = await usersBuilderService.createTestUser({
            username: `internal_error_admin_${Date.now()}`,
            plainPassword: plainPassword,
            role: UserRole.ADMIN,
        });

        createdUserIds.push(createdAdmin.id);

        const token = await loginAndGetToken(createdAdmin.username, plainPassword);

        const res = await request(app.getHttpServer())
            .get("/internal/errors/test")
            .query({ type: "app" })
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(400);
    });
});