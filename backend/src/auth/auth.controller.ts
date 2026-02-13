import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { CreateUserDto } from "../users/dto/create-user.dto";
import {
    ApiBearerAuth,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
    ApiBadRequestResponse,
} from "@nestjs/swagger";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
    constructor(private auth: AuthService) {}

    @ApiOperation({
        summary: "Login",
        description: "Authenticates a user and returns a JWT access token.",
    })
    @ApiOkResponse({ description: "Login successful (token and user data)." })
    @ApiBadRequestResponse({ description: "Invalid request body or validation error." })
    @Post("login")
    login(@Body() body: LoginDto) {
        return this.auth.login(body.username, body.password);
    }

    @ApiOperation({
        summary: "Register",
        description: "Creates a new user and automatically logs them in.",
    })
    @ApiOkResponse({ description: "Registration successful (token and user data)." })
    @ApiBadRequestResponse({ description: "Invalid request body or validation error." })
    @Post("register")
    async register(@Body() body: CreateUserDto) {
        return this.auth.registerAndLogin(body.username, body.password);
    }

    @ApiOperation({
        summary: "Get current user (me)",
        description: "Returns the currently authenticated user based on the JWT token.",
    })
    @ApiBearerAuth("access-token")
    @ApiOkResponse({ description: "Authenticated user data." })
    @ApiUnauthorizedResponse({ description: "Missing, invalid, or expired token." })
    @UseGuards(JwtAuthGuard)
    @Get("me")
    me(@Req() req: any) {
        return this.auth.getMe(req.user.userId);
    }

    @ApiOperation({
        summary: "Debug endpoint",
        description: "Development-only endpoint returning runtime debug information.",
    })
    @ApiOkResponse({ description: "Debug information." })
    @Get("debug")
    debug() {
        return {
            bootId: process.env.BOOT_ID ?? null,
            pid: process.pid,
            now: new Date().toISOString(),
        };
    }
}
