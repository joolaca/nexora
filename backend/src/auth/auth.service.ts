//backend/src/auth/auth.service.ts
import {Injectable, UnauthorizedException} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import {UsersService} from "../users/users.service";

@Injectable()
export class AuthService {
    constructor(private users: UsersService, private jwt: JwtService) {
    }

    async login(username: string, password: string) {

        const user = await this.users.findByUsername(username);
        if (!user) throw new UnauthorizedException("Invalid credentials");

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) throw new UnauthorizedException("Invalid credentials");

        const token = await this.jwt.signAsync(
            {userId: String(user._id)},
            {expiresIn: "1d"}
        );

        return {
            token,
            user: {id: String(user._id), username: user.username},
        };
    }

    async getMe(userId: string) {
        const user = await this.users.findById(userId);
        if (!user) throw new UnauthorizedException("Invalid token");

        return {id: String(user._id), username: user.username};
    }

    async registerAndLogin(username: string, password: string) {
        const user = await this.users.createUser(username, password);
        const token = await this.jwt.signAsync({ userId: user.id }, { expiresIn: "1d" });

        return { token, user };
    }

}
