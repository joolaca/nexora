import {
    Controller,
    Get,
    Query,
    HttpStatus,
    Post,
    Patch,
    Body,
    UseGuards,
} from "@nestjs/common";
import { AppException } from "../../common/errors/app-exception";
import {
    ApiTags,
    ApiOperation,
    ApiQuery,
    ApiBody,
    ApiResponse,
    ApiBearerAuth,
    ApiForbiddenResponse,
    ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { AdminGuard } from "../../auth/admin.guard";

@ApiTags("internal-errors")
@ApiBearerAuth("access-token")
@ApiUnauthorizedResponse({ description: "Missing, invalid, or expired token." })
@ApiForbiddenResponse({ description: "Admin role required." })
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller("internal/errors")
export class InternalErrorsController {

    @Get("test")
    @ApiOperation({ summary: "Trigger different types of test errors" })
    @ApiQuery({
        name: "type",
        required: false,
        enum: ["app", "system", "http"],
        description: "Type of error to trigger",
    })
    @ApiResponse({
        status: 200,
        description: "No error triggered",
    })
    @ApiResponse({
        status: 400,
        description: "AppException triggered",
    })
    @ApiResponse({
        status: 404,
        description: "Not found error triggered",
    })
    @ApiResponse({
        status: 500,
        description: "System error triggered",
    })
    testError(@Query("type") type?: string) {
        if (type === "app") {
            throw new AppException(HttpStatus.BAD_REQUEST, "TEST_APP_ERROR", {
                message: "This is a test AppException",
                severity: "warn",
                kind: "business",
            });
        }

        if (type === "system") {
            throw new Error("Test system error");
        }

        if (type === "http") {
            throw new AppException(HttpStatus.NOT_FOUND, "TEST_NOT_FOUND");
        }

        return {
            message: "No error triggered",
        };
    }

    @Post("test")
    @ApiOperation({ summary: "Trigger POST error with request body" })
    @ApiBody({
        schema: {
            example: {
                email: "test@test.com",
                name: "Laca",
            },
        },
    })
    @ApiResponse({
        status: 400,
        description: "Test POST body error",
    })
    testPostBody(@Body() body: any) {
        throw new AppException(HttpStatus.BAD_REQUEST, "TEST_POST_BODY_ERROR", {
            message: "Test POST body error",
            context: {
                receivedBody: body,
            },
        });
    }

    @Patch("test")
    @ApiOperation({ summary: "Trigger PATCH error with request body" })
    @ApiBody({
        schema: {
            example: {
                nickname: "TesztNev",
            },
        },
    })
    @ApiResponse({
        status: 400,
        description: "Test PATCH body error",
    })
    testPatchBody(@Body() body: any) {
        throw new AppException(HttpStatus.BAD_REQUEST, "TEST_PATCH_BODY_ERROR", {
            message: "Test PATCH body error",
            shouldPersist: true,
        });
    }
}