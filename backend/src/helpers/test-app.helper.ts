import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { AppModule } from "../app.module";

export async function createTestApp(): Promise<{
    app: INestApplication;
    modRef: TestingModule;
}> {
    const modRef = await Test.createTestingModule({
        imports: [AppModule],
    }).compile();

    const app = modRef.createNestApplication();
    await app.init();

    return { app, modRef };
}
