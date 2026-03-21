import * as Joi from "joi";

export const envValidationSchema = Joi.object({
    PORT: Joi.number().default(5000),
    MONGO_URI: Joi.string().required(),
    MONGO_URI_TEST: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
});
