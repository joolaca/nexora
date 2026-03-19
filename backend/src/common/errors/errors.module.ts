//backend/src/common/errors/errors.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ErrorLog, ErrorLogSchema } from "./error-log.schema";
import { ErrorReportingService } from "./error-reporting.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: ErrorLog.name, schema: ErrorLogSchema },
        ]),
    ],
    providers: [ErrorReportingService],
    exports: [ErrorReportingService],
})
export class ErrorsModule {}