//backend/src/main.ts
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { ResponseWrapInterceptor } from "./common/interceptors/response-wrap.interceptor";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

console.log("BOOT_ID", Date.now(), "PID", process.pid);

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        bufferLogs: false,
        logger: ["log", "error", "warn", "debug", "verbose"],
    });

    app.enableCors({ origin: true, credentials: true });

    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalInterceptors(new ResponseWrapInterceptor());

    const config = new DocumentBuilder()
        .setTitle("Nexora API")
        .setDescription("Nexora backend OpenAPI dokumentáció")
        .setVersion("1.0.0")
        .addBearerAuth({ type: "http", scheme: "bearer", bearerFormat: "JWT" }, "access-token")
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api", app, document); // http://localhost:5000/api

    const port = process.env.PORT ? Number(process.env.PORT) : 5000;
    await app.listen(port);

    console.log("🚀 Nexora server running 🚀", port);
    console.log("Swagger:", `http://localhost:${port}/api`);
    console.log("OpenAPI JSON:", `http://localhost:${port}/api-json`);
}

bootstrap();
