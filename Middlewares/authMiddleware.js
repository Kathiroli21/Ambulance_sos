import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { verifyToken } from '../utils/generateToken.js';

export const protect = async (req, res, next) => {
try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
    }
    
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);
    
    if (!user) {
    return res.status(401).json({ message: 'Not authorized, user not found' });
    }
    
    req.user = user;
    next();
} catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
}
};

export const roleCheck = (roles) => {
return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied' });
    }
    next();
};
};