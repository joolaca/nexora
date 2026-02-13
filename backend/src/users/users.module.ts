// backend/src/users/users.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./user.schema";
import { UsersService } from "./users.service";
import { UsersRepository } from "./users.repository";
import { UsersListRepository } from "./users.list.repository";
import { UsersController } from "./users.controller";
import { ClansModule } from "../clans/clans.module";

@Module({
    imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), ClansModule],
    controllers: [UsersController],
    providers: [UsersService, UsersRepository, UsersListRepository],
    exports: [UsersService, UsersRepository, UsersListRepository],
})
export class UsersModule {}
