// backend/src/internal/errors/test/internal-errors-auth.integration.spec.ts
// npx jest internal-errors-auth.integration.spec.ts --runInBand

import request from "supertest";
import { INestApplication } from "@nestjs/common";
import { UsersBuilderService } from "../../../users/users-builder.service";
import { UserRole } from "../../../users/user-role.enum";
import { createTestApp } from "../../../helpers/test-app.helper";
import { loginAndGetToken } from "../../../helpers/test-auth.helper";

describe("InternalErrors (integration) /internal/errors", () => {
    let app: INestApplication;
    let usersBuilderService: UsersBuilderService;

    const createdUserIds: string[] = [];

    beforeAll(async () => {
        const testApp = await createTestApp();
        app = testApp.app;
        usersBuilderService = testApp.modRef.get(UsersBuilderService);
    });

    afterEach(async () => {
        for (const userId of createdUserIds.splice(0)) {
            await usersBuilderService.deleteUserById(userId);
        }
    });

    afterAll(async () => {
        await app.close();
    });

    it("GET /internal/errors/test without token -> 401", async () => {
        const res = await request(app.getHttpServer())
            .get("/internal/errors/test");

        expect(res.status).toBe(401);
        expect(res.body.error).toMatchObject({
            errorCode: "AUTH_UNAUTHORIZED",
            kind: "auth",
        });
    });

    it("GET /internal/errors/test with normal user token -> 403", async () => {
        const plainPassword = "secret123";
        const createdUser = await usersBuilderService.createTestUser({
            username: `internal_error_user_${Date.now()}`,
            plainPassword,
            role: UserRole.USER,
        });

        createdUserIds.push(createdUser.id);

        const token = await loginAndGetToken({
            app,
            username: createdUser.username,
            password: plainPassword,
        });

        const res = await request(app.getHttpServer())
            .get("/internal/errors/test")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(403);
        expect(res.body.error).toMatchObject({
            errorCode: "ADMIN_ROLE_REQUIRED",
            kind: "permission",
        });
    });

    it("GET /internal/errors/test?type=app with admin token -> should reach controller and return 400", async () => {
        const plainPassword = "secret123";
        const createdAdmin = await usersBuilderService.createTestUser({
            username: `internal_error_admin_${Date.now()}`,
            plainPassword,
            role: UserRole.ADMIN,
        });

        createdUserIds.push(createdAdmin.id);

        const token = await loginAndGetToken({
            app,
            username: createdAdmin.username,
            password: plainPassword,
        });

        const res = await request(app.getHttpServer())
            .get("/internal/errors/test")
            .query({ type: "app" })
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(400);
    });
});
