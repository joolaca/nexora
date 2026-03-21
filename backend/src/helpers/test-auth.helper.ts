import request from "supertest";
import { INestApplication } from "@nestjs/common";

export async function loginAndGetToken(params: {
    app: INestApplication;
    username: string;
    password: string;
}) {
    const res = await request(params.app.getHttpServer())
        .post("/auth/login")
        .send({
            username: params.username,
            password: params.password,
        });

    expect([200, 201]).toContain(res.status);
    expect(res.body).toEqual(
        expect.objectContaining({
            token: expect.any(String),
        }),
    );

    return res.body.token as string;
}
