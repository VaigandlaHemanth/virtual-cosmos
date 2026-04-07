const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

// Initialize DOMPurify for server-side sanitization
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Configuration constants
const CANVAS_WIDTH = parseInt(process.env.CANVAS_WIDTH) || 800;
const CANVAS_HEIGHT = parseInt(process.env.CANVAS_HEIGHT) || 600;
const MAX_USERNAME_LENGTH = 50;
const MAX_MESSAGE_LENGTH = 500;

/**
 * Validator class for input validation
 */
class Validator {
  /**
   * Check if value is a finite number
   * @param {*} value - Value to check
   * @returns {boolean}
   */
  isNumeric(value) {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
  }

  /**
   * Validate position coordinates
   * @param {Object} position - Position object {x, y}
   * @param {number} canvasWidth - Canvas width
   * @param {number} canvasHeight - Canvas height
   * @returns {Object} {valid: boolean, error?: string}
   */
  isPositionValid(position, canvasWidth = CANVAS_WIDTH, canvasHeight = CANVAS_HEIGHT) {
    // Type validation
    if (typeof position !== 'object' || position === null) {
      return { valid: false, error: 'Position must be an object' };
    }

    // Numeric validation
    if (!this.isNumeric(position.x) || !this.isNumeric(position.y)) {
      return { valid: false, error: 'Coordinates must be finite numbers' };
    }

    // Boundary validation
    if (position.x < 0 || position.x > canvasWidth ||
        position.y < 0 || position.y > canvasHeight) {
      return { valid: false, error: 'Position out of bounds' };
    }

    return { valid: true };
  }

  /**
   * Validate username
   * @param {string} username - Username to validate
   * @returns {Object} {valid: boolean, error?: string}
   */
  isUsernameValid(username) {
    // Type validation
    if (typeof username !== 'string') {
      return { valid: false, error: 'Username must be a string' };
    }

    // Length validation
    if (username.length < 1 || username.length > MAX_USERNAME_LENGTH) {
      return { valid: false, error: `Username must be 1-${MAX_USERNAME_LENGTH} characters` };
    }

    // Character validation (alphanumeric, spaces, dashes, underscores)
    const validPattern = /^[a-zA-Z0-9\s\-_]+$/;
    if (!validPattern.test(username)) {
      return { valid: false, error: 'Username contains invalid characters' };
    }

    return { valid: true };
  }

  /**
   * Validate chat message
   * @param {string} message - Message to validate
   * @returns {Object} {valid: boolean, error?: string}
   */
  isMessageValid(message) {
    // Type validation
    if (typeof message !== 'string') {
      return { valid: false, error: 'Message must be a string' };
    }

    // Length validation
    if (message.length === 0) {
      return { valid: false, error: 'Message cannot be empty' };
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return { valid: false, error: `Message exceeds ${MAX_MESSAGE_LENGTH} characters` };
    }

    return { valid: true };
  }

  /**
   * Sanitize message to prevent XSS attacks
   * @param {string} message - Message to sanitize
   * @returns {string} Sanitized message
   */
  sanitizeMessage(message) {
    // Use DOMPurify to strip all HTML tags
    const clean = DOMPurify.sanitize(message, {
      ALLOWED_TAGS: [], // No HTML tags allowed
      ALLOWED_ATTR: [], // No attributes allowed
      KEEP_CONTENT: true // Keep text content
    });

    return clean;
  }

  /**
   * Lightweight sanitization without DOMPurify (alternative)
   * @param {string} message - Message to sanitize
   * @returns {string} Sanitized message
   */
  sanitizeMessageLightweight(message) {
    return message
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
}

// Export singleton instance
module.exports = new Validator();
