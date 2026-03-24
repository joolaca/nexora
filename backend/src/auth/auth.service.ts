import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { AppException } from "../common/errors/app-exception";
import { UsersRepository } from "../users/users.repository";
import { UsersService } from "../users/users.service";

@Injectable()
export class AuthService {
    constructor(
        private readonly usersRepo: UsersRepository,
        private readonly usersService: UsersService,
        private readonly jwt: JwtService,
    ) {}

    async login(username: string, password: string) {
        const user = await this.usersRepo.findByUsername(username);

        if (!user) {
            throw new AppException(409, "INVALID_CREDENTIALS", );
        }

        const ok = await bcrypt.compare(password, user.password);

        if (!ok) {
            throw new AppException(409, "INVALID_CREDENTIALS", );
        }

        const token = await this.jwt.signAsync(
            { userId: String(user._id) },
            { expiresIn: "1d" },
        );

        return {
            token,
            user: {
                id: String(user._id),
                username: user.username,
            },
        };
    }

    async getMe(userId: string) {
        const user = await this.usersRepo.findById(userId);

        if (!user) {
            throw new AppException(409, "INVALID_TOKEN", );
        }

        return {
            id: String(user._id),
            username: user.username,
            role: user.role
        };
    }

    async registerAndLogin(username: string, password: string) {
        const exists = await this.usersRepo.findByUsername(username);

        if (exists) {
            throw new AppException(409, "USERNAME_TAKEN", );
        }

        const created = await this.usersService.createUserRecord({
            username,
            plainPassword: password,
        });

        const token = await this.jwt.signAsync(
            { userId: String(created._id) },
            { expiresIn: "1d" },
        );

        return {
            token,
            user: {
                id: String(created._id),
                username: created.username,
            },
        };
    }
}