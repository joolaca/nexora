// backend/src/seed/seed.ts
import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import * as dotenv from "dotenv";
import { SeedModule } from "./seed.module";
import { SeedService } from "./seed.service";

async function bootstrap() {
    dotenv.config();

    if (process.env.NODE_ENV === "production") {
        throw new Error("SEED is disabled in production.");
    }
    if (!process.env.MONGO_URI) {
        throw new Error("Missing MONGO_URI");
    }

    const app = await NestFactory.createApplicationContext(SeedModule, {
        logger: ["log", "error", "warn"],
    });

    try {
        const seedService = app.get(SeedService);
        const result = await seedService.run();
        console.log("✅ Seed done:", result);
    } finally {
        await app.close();
        console.log("✅ Seed context closed");
    }
}

bootstrap().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
