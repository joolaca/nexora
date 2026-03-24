import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { ResponseWrapInterceptor } from "./common/interceptors/response-wrap.interceptor";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";

console.log("BOOT_ID", Date.now(), "PID", process.pid);

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        bufferLogs: false,
        logger: ["log", "error", "warn", "debug", "verbose"],
    });

    const configService = app.get(ConfigService);

    const appName = configService.get<string>("APP_NAME") ?? "App";
    const swaggerTitle = configService.get<string>("SWAGGER_TITLE") ?? `${appName} API`;
    const swaggerDescription =
        configService.get<string>("SWAGGER_DESCRIPTION") ?? `${appName} backend OpenAPI documentation`;
    const port = Number(configService.get<string>("PORT") ?? 5000);

    app.enableCors({ origin: true, credentials: true });

    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalInterceptors(new ResponseWrapInterceptor());

    const config = new DocumentBuilder()
        .setTitle(swaggerTitle)
        .setDescription(swaggerDescription)
        .setVersion("1.0.0")
        .addBearerAuth({ type: "http", scheme: "bearer", bearerFormat: "JWT" }, "access-token")
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api", app, document);

    await app.listen(port);

    console.log(`🚀 ${appName} server running 🚀`, port);
    console.log("Swagger:", `http://localhost:${port}/api`);
    console.log("OpenAPI JSON:", `http://localhost:${port}/api-json`);
}

bootstrap();