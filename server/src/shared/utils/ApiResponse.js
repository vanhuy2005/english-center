/**
 * API Response Utility
 * Cung cấp các phương thức để tạo response format nhất quán
 */
class ApiResponse {
  /**
   * Success response
   * @param {Object} res - Express response object
   * @param {*} data - Data to send
   * @param {String} message - Success message
   * @param {Number} statusCode - HTTP status code (default: 200)
   */
  static success(res, data = null, message = "Success", statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  /**
   * Error response
   * @param {Object} res - Express response object
   * @param {String} message - Error message
   * @param {Number} statusCode - HTTP status code (default: 400)
   * @param {*} errors - Additional error details
   */
  static error(res, message = "Error", statusCode = 400, errors = null) {
    const response = {
      success: false,
      message,
    };

    if (errors) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Not found response
   * @param {Object} res - Express response object
   * @param {String} message - Not found message
   */
  static notFound(res, message = "Resource not found") {
    return this.error(res, message, 404);
  }

  /**
   * Unauthorized response
   * @param {Object} res - Express response object
   * @param {String} message - Unauthorized message
   */
  static unauthorized(res, message = "Unauthorized") {
    return this.error(res, message, 401);
  }
}

module.exports = ApiResponse;
