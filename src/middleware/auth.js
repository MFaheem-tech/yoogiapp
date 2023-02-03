import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const auth = (req, res, next) => {
  const { headers } = req;
  const accessToken = headers.authorization
    ? headers.authorization.split(" ")[1]
    : null;
  if (!accessToken) {
    return res.status(403).json({ msg: "UnAuthorized Acess Denied." });
  }
  try {
    const decoded = jwt.verify(accessToken, process.env.SECRET_KEY);
    req.user = decoded;
    return next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      console.log("Token Expired");
      return res.status(401).json({ msg: "Token has expired." });
    }
    if (err.name === "JsonWebTokenError") {
      console.log("JSON Web Token Error");
      return res.status(401).json({ msg: err.message });
    }
    console.log("Error");
    return res.status(401).json({ msg: err.message });
  }
};

export default auth;
