import { Module } from "@nestjs/common";
import { InternalErrorsController } from "./errors/internal-errors.controller";
import { AdminGuard } from "../auth/admin.guard";
import { UsersModule } from "../users/users.module";

@Module({
    imports: [UsersModule],
    controllers: [InternalErrorsController],
    providers: [AdminGuard],
})
export class InternalModule {}