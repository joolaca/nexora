//npx jest users.smoke.integration.spec.ts --runInBand
import request from "supertest";
import { INestApplication } from "@nestjs/common";
import { createTestApp } from "../../helpers/test-app.helper";

describe("Users (smoke) /users", () => {
    let app: INestApplication;

    beforeAll(async () => {
        const testApp = await createTestApp();
        app = testApp.app;
    });

    afterAll(async () => {
        await app.close();
    });

    it("GET /users without token -> 401", async () => {
        const res = await request(app.getHttpServer()).get("/users");

        expect(res.status).toBe(401);
        expect(res.body.error).toMatchObject({
            errorCode: "AUTH_UNAUTHORIZED",
            kind: "auth",
        });
    });
});
