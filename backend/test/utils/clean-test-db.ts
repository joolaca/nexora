import type { INestApplication } from "@nestjs/common";
import { getConnectionToken } from "@nestjs/mongoose";
import type { Connection } from "mongoose";

export async function cleanTestDb(app: INestApplication) {
    if (process.env.NODE_ENV !== "test") {
        throw new Error("cleanTestDb can only run in NODE_ENV=test");
    }

    const conn = app.get<Connection>(getConnectionToken());

    // ✅ TS + valós védelem: ha még nincs csatlakozva, ne menjünk tovább
    const db = conn.db;
    if (!db) {
        throw new Error("Mongo connection is not ready (conn.db is undefined)");
    }

    await db.dropDatabase();
}
