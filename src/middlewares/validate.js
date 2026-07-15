const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    req.body = parsed.body || req.body;
    req.query = parsed.query || req.query;
    req.params = parsed.params || req.params;

    next();
  } catch (error) {
    if (error.name === 'ZodError') {
      const messages = error.errors.map(err => `${err.path.slice(1).join('.')}: ${err.message}`).join(', ');
      return res.status(400).json({
        status: 'fail',
        message: `Validation error: ${messages}`,
      });
    }
    next(error);
  }
};

module.exports = validate;
