//backend/src/app.module.ts
import { Module, MiddlewareConsumer, NestModule } from "@nestjs/common";
import { RequestLoggerMiddleware } from "./common/middleware/request-logger.middleware";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { ClansModule } from "./clans/clans.module";
import { envValidationSchema } from "./config/env.validation";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: envValidationSchema,
        }),

        MongooseModule.forRootAsync({
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => {
                const nodeEnv = config.get<string>("NODE_ENV") ?? "development";
                const uri =
                    nodeEnv === "test"
                        ? config.get<string>("MONGO_URI_TEST")
                        : config.get<string>("MONGO_URI");

                if (!uri) {
                    throw new Error(`Missing Mongo URI for NODE_ENV=${nodeEnv}`);
                }

                return { uri };
            },
        }),


        UsersModule,
        AuthModule,
        ClansModule,
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(RequestLoggerMiddleware)
            .forRoutes("*"); // MINDEN route
    }
}
