// backend/src/internal/internal.module.ts
import { Module } from "@nestjs/common";
import { InternalErrorsController } from "./errors/internal-errors.controller";

@Module({
    controllers: [InternalErrorsController],
})
export class InternalModule {}