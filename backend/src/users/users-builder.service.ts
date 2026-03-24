import { Injectable } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersFactory } from "./users.factory";
import { CreateUserOverrides } from "./users.types";

@Injectable()
export class UsersBuilderService {
    constructor(
        private readonly usersService: UsersService,
        private readonly usersFactory: UsersFactory,
    ) {}

    async createTestUser(overrides: CreateUserOverrides = {}) {
        const input = this.usersFactory.buildCreateUserInput(overrides);
        return await this.usersService.createUserRecord(input);
    }

    async deleteUserById(userId: string) {
        return this.usersService.deleteUserById(userId);
    }

}