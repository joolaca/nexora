//backend/src/users/users.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./user.schema";
import { UsersService } from "./users.service";
import { UsersRepository } from "./users.repository";
import { UsersController } from "./users.controller";
import { Clan, ClanSchema } from "../clans/clan.schema";
import { ClansModule } from "../clans/clans.module";

@Module({
    imports: [
        MongooseModule.forFeature([ { name: User.name, schema: UserSchema }, ]),
        ClansModule
    ],
    controllers: [UsersController],
    providers: [UsersService, UsersRepository],
    exports: [UsersService],
})
export class UsersModule {}
