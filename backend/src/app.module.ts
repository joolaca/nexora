import { Module, MiddlewareConsumer, NestModule } from "@nestjs/common";
import { RequestLoggerMiddleware } from "./common/middleware/request-logger.middleware";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { envValidationSchema } from "./config/env.validation";

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
        AuthModule,
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(RequestLoggerMiddleware)
            .forRoutes("*"); // MINDEN route
    }
}
