var jwt = require('jsonwebtoken');
const JWT_SECRET = 'rs';

const fetchuser = (req, res, next) => {
    // Get the user from the JWT token and add id to req
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).send({ success: false, error: "Authentication token missing. Please log in." });
    }

    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;
        next();
    } catch (error) {
        return res.status(401).send({ success: false, error: "Invalid or expired token. Please log in again." });
    }
}

module.exports = fetchuser;

