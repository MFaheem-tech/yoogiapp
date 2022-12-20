export const validate = (schema, property) => {
  return async (req, res, next) => {
    const { error } = await schema.validate(req.body);
    const valid = error == null;
    if (valid) {
      next();
    } else {
      const { details } = error;
      const message = details.map((i) => i.message).join(",");
      console.log("error", message);
      res.status(400).json({ msg: "something went wrong" });
    }
  };
};
