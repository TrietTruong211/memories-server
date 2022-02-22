import jwt from "jsonwebtoken";

// wants to like a post
// click button => middleware to authentication (next) => like controller

// middleware, do something then move to then nex thing
const auth = async (req, res, next) => {
  try {
    // req.headers.Authorization comes with req, populated by interceptors in client side
    const token = req.headers.authorization.split(" ")[1]; //token is on the 1st array item after split, note authorization is lower case

    const isCustomAuth = token.length < 500; //google auth has length of > 500, if < 500 it's our custom token

    let decodedData;

    if (token && isCustomAuth) {
      decodedData = jwt.verify(token, "test"); //it has to the the same secret when use to create token, currently "test"
      // with decoded data, we know which user is loging in
      req.userId = decodedData?.id;
    } else {
      decodedData = jwt.decode(token);
      req.userId = decodedData?.sub; //sub is google's id
    }
    next();
  } catch (error) {
    console.log(error);
  }
};

export default auth;
