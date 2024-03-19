import Joi from 'joi';

const validateSchema = Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(8).required(),
    name: Joi.string().trim().min(3).required()
})

export default {
    validateSchema
}