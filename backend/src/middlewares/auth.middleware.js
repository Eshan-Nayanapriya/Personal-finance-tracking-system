import jwt from "jsonwebtoken";

// Verify token
export async function verifyToken(request, response, next) {
  const authHeader =
    request.headers.authorization || request.headers.Authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return response.status(403).json({
      message: "Token is required!",
      error: true,
      success: false,
    });
  }

  const token = authHeader.split(" ")[1]; // Extract token

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    request.user = decoded;
    console.log("The decoded user is : ", request.user);
    next();
  } catch (error) {
    return response.status(401).json({
      message: "Unauthorized! Invalid or expired token.",
      error: true,
      success: false,
    });
  }
}
