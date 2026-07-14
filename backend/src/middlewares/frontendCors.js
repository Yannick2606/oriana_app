export function frontendCors(frontendOrigin) {
  return (req, res, next) => {
    const requestOrigin = req.get('origin');

    if (!requestOrigin) return next();
    if (!frontendOrigin || requestOrigin !== frontendOrigin) {
      return res.status(403).json({ error: 'CORS_ORIGIN_DENIED' });
    }

    res.set('Access-Control-Allow-Origin', frontendOrigin);
    res.set('Access-Control-Allow-Credentials', 'true');
    res.set('Vary', 'Origin');

    if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      return res.sendStatus(204);
    }

    return next();
  };
}
