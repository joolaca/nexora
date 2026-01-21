import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { CreateUserDto } from "../users/dto/create-user.dto";

@Controller("auth")
export class AuthController {
    constructor(private auth: AuthService) {}

    @Post("login")
    login(@Body() body: LoginDto) {
        return this.auth.login(body.username, body.password);
    }

    @Post("register")
    async register(@Body() body: CreateUserDto) {
        return this.auth.registerAndLogin(body.username, body.password);
    }

    @UseGuards(JwtAuthGuard)
    @Get("me")
    me(@Req() req: any) {
        return this.auth.getMe(req.user.userId);
    }

    @Get("debug")
    debug() {
        return { bootId: process.env.BOOT_ID ?? null, pid: process.pid, now: new Date().toISOString(), azta:'paszta' };
    }

}
