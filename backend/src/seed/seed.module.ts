//backend/src/seed/seed.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UsersModule } from "../users/users.module";
import { SeedService } from "./seed.service";
import { envValidationSchema } from "../config/env.validation";
import { ClansModule } from "../clans/clans.module";
import { Clan, ClanSchema } from "../clans/clan.schema";
import { User, UserSchema } from "../users/user.schema";

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
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Clan.name, schema: ClanSchema },
        ]),
        UsersModule,
        ClansModule,
    ],
    providers: [SeedService],
})
export class SeedModule {}
