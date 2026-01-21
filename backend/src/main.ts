//backend/src/main.ts
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { ResponseWrapInterceptor } from "./common/interceptors/response-wrap.interceptor";
import { GlobalHttpExceptionFilter } from "./common/filters/http-exception.filter";

console.log("BOOT_ID", Date.now(), "PID", process.pid);

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors({ origin: true, credentials: true });

    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalInterceptors(new ResponseWrapInterceptor());
    app.useGlobalFilters(new GlobalHttpExceptionFilter());

    await app.listen(process.env.PORT ? Number(process.env.PORT) : 5000);
    console.log("Nest server running");
}

bootstrap();
