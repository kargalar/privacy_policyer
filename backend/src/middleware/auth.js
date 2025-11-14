import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

export const getTokenFromContext = (context) => {
    const authHeader = context.req?.headers?.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return null;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        return null;
    }
};

export const requireAuth = (context) => {
    const user = getTokenFromContext(context);
    if (!user) {
        throw new Error('Authentication required');
    }
    return user;
};

export const requireAdmin = (context) => {
    const user = requireAuth(context);
    if (user.status !== 'ADMIN') {
        throw new Error('Admin access required');
    }
    return user;
};
