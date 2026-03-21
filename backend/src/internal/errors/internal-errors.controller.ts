// backend/src/internal/errors/internal-errors.controller.ts

import {
    Controller,
    Get,
    Query,
    HttpStatus,
    Post,
    Patch,
    Body,
} from "@nestjs/common";
import { AppException } from "../../common/errors/app-exception";
import {
    ApiTags,
    ApiOperation,
    ApiQuery,
    ApiBody,
    ApiResponse,
} from "@nestjs/swagger";

@ApiTags("internal-errors")
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