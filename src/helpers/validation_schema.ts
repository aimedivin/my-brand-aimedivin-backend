import Joi from 'joi';

const validateSchema = Joi.object({
    email: Joi.string().email().lowercase().required(),
    name: Joi.string().trim().min(3).required(),
    dob: Joi.string().trim().min(3).required(),
    password: Joi.string().trim().min(8).required()
}).unknown();

export default {
    validateSchema
}