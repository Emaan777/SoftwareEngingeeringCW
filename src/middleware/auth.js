/**
 * Authentication middleware
 */

// Authentication middleware to check if user is logged in
const requireAuth = (req, res, next) => {
    // Public routes (always accessible)
    const publicRoutes = ['/login', '/register', '/api/debug'];
    const publicPathPrefixes = ['/css/', '/js/', '/images/'];
    
    // Check for public routes or path prefixes
    if (publicRoutes.includes(req.path) || 
        publicPathPrefixes.some(prefix => req.path.startsWith(prefix)) ||
        req.path === '/favicon.ico') {
        return next();
    }
    
    // Check if user is logged in via session
    if (req.session.isLoggedIn) {
        return next();
    }
    
    // Redirect to login page for HTML requests
    if (req.accepts('html')) {
        return res.redirect('/login');
    }
    
    // Return 401 for API requests
    return res.status(401).json({ error: 'Authentication required' });
};

module.exports = { requireAuth }; 