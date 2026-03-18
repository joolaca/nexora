// backend/src/users/users.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UsersSchema } from "./users.schema";
import { UsersService } from "./users.service";
import { UsersRepository } from "./users.repository";
import { UsersListRepository } from "./users.list.repository";
import { UsersController } from "./users.controller";
import { ClansModule } from "../clans/clans.module";
import { UsersFixtureService } from "./users-fixture.service";
import { UsersFactory } from "./users.factory";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UsersSchema }]),
        ClansModule,
    ],
    controllers: [UsersController],
    providers: [
        UsersService,
        UsersRepository,
        UsersListRepository,
        UsersFactory,
        UsersFixtureService,
    ],
    exports: [
        UsersService,
        UsersRepository,
        UsersListRepository,
        UsersFactory,
        UsersFixtureService,
    ],
})
export class UsersModule {}