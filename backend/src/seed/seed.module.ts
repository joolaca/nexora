//backend/src/seed/seed.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UsersModule } from "../users/users.module";
import { SeedService } from "./seed.service";
import { envValidationSchema } from "../config/env.validation";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: envValidationSchema,
        }),

        MongooseModule.forRootAsync({
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
                uri: config.get<string>("MONGO_URI")!,
            }),
        }),

        UsersModule,
    ],
    providers: [SeedService],
})
export class SeedModule {}
