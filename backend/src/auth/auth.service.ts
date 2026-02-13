// backend/src/auth/auth.service.ts
import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { AppException } from "../common/errors/app-exception";
import { UsersRepository } from "../users/users.repository";

@Injectable()
export class AuthService {
    constructor(
        private readonly usersRepo: UsersRepository,
        private readonly jwt: JwtService
    ) {}

    async login(username: string, password: string) {
        const user = await this.usersRepo.findByUsername(username);
        if (!user) throw new AppException(409, "INVALID_CREDENTIALS", "Invalid credentials");

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) throw new AppException(409, "INVALID_CREDENTIALS", "Invalid credentials");

        const token = await this.jwt.signAsync({ userId: String(user._id) }, { expiresIn: "1d" });

        return {
            token,
            user: { id: String(user._id), username: user.username },
        };
    }

    async getMe(userId: string) {
        const user = await this.usersRepo.findById(userId);
        if (!user) throw new AppException(409, "INVALID_TOKEN", "Invalid token");

        return { id: String(user._id), username: user.username };
    }

    async registerAndLogin(username: string, password: string) {
        const exists = await this.usersRepo.findByUsername(username);
        if (exists) throw new AppException(409, "USERNAME_TAKEN", "Username already taken");

        const passwordHash = await bcrypt.hash(password, 10);

        const created = await this.usersRepo.createUser({ username, passwordHash });

        const token = await this.jwt.signAsync({ userId: String(created._id) }, { expiresIn: "1d" });

        return {
            token,
            user: { id: String(created._id), username: created.username },
        };
    }
}
