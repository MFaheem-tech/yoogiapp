import Joi from "joi";
export const schema = {
  register: Joi.object({
    name: Joi.string().trim().required(),
    email: Joi.string().email().trim().required(),
    password: Joi.string().alphanum().min(6).max(64).trim().required(),
  }),
};
