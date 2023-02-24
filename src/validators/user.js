import Joi from "joi";
export const schema = {
  register: Joi.object({
    name: Joi.string().trim().required(),
    email: Joi.string().email().trim().required(),
    password: Joi.string().min(6).max(15).required(),
  }),
};
