// Helper utility to safely parse and sanitize pagination query parameters.
// Enforces a strict upper bound limit (max 100) and lower bounds (page >= 1, limit >= 1) to prevent DoS.

exports.getPagination = (query = {}, defaultLimit = 10, maxLimit = 100) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || defaultLimit, 1), maxLimit);
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};
