// backend/src/helpers/auth.helper.ts
import { JwtService } from "@nestjs/jwt";

export function createTestJwt(params: {
    userId: string;
    jwtService: JwtService;
}) {
    return params.jwtService.sign(
        {
            userId: params.userId,
        },
        {
            expiresIn: "1d",
        },
    );
}