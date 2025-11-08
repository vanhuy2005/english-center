/**
 * API Response Helper
 * Standardized response format
 */

/**
 * Success Response
 */
exports.successResponse = (
  res,
  data = null,
  message = "Success",
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Error Response
 */
exports.errorResponse = (
  res,
  message = "Error",
  statusCode = 500,
  errors = null
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
};

/**
 * Paginated Response
 */
exports.paginatedResponse = (
  res,
  data,
  page,
  pageSize,
  total,
  message = "Success"
) => {
  const parsedPage = parseInt(page, 10);
  const parsedPageSize = parseInt(pageSize, 10);
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page: parsedPage,
      pageSize: parsedPageSize,
      total,
      totalPages: Math.ceil(total / parsedPageSize),
      hasNext: parsedPage * parsedPageSize < total,
      hasPrev: parsedPage > 1,
    },
  });
};
