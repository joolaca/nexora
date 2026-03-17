//backend/src/users/tests/users.smoke.integration.spec.ts
//npx jest users.smoke.integration.spec.ts --runInBand
import request from "supertest";
import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { AppModule } from "../../app.module";

describe("Users (smoke) /users", () => {
    let app: INestApplication;

    beforeAll(async () => {
        const modRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = modRef.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it("GET /users without token -> 401", async () => {
        const res = await request(app.getHttpServer()).get("/users");

        expect(res.status).toBe(401);

        expect(res.body).toMatchObject({
            statusCode: 401,
            message: "Unauthorized",
        });
    });
});
