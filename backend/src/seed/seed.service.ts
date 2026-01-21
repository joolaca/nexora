// backend/src/seed/seed.service.ts
import { Injectable } from "@nestjs/common";
import { UsersService } from "../users/users.service";

@Injectable()
export class SeedService {
    constructor(private readonly users: UsersService) {}

    async run() {
        const usersRes = await this.users.seedTestUsers(50, "123");
        return {
            users: usersRes,
        };
    }
}
