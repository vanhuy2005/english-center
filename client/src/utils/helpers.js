/**
 * Safely get nested object property
 * @param {object} obj - Object to get property from
 * @param {string} path - Path to property (e.g., 'user.profile.name')
 * @param {any} defaultValue - Default value if property not found
 * @returns {any} Property value or default value
 */
export const getNestedProperty = (obj, path, defaultValue = undefined) => {
  const keys = path.split(".");
  let result = obj;

  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue;
    }
    result = result[key];
  }

  return result !== undefined ? result : defaultValue;
};

/**
 * Deep clone object
 * @param {any} obj - Object to clone
 * @returns {any} Cloned object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== "object") return obj;
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if object is empty
 * @param {object} obj - Object to check
 * @returns {boolean} True if empty
 */
export const isEmpty = (obj) => {
  if (obj === null || obj === undefined) return true;
  if (Array.isArray(obj) || typeof obj === "string") return obj.length === 0;
  if (typeof obj === "object") return Object.keys(obj).length === 0;
  return false;
};

/**
 * Omit properties from object
 * @param {object} obj - Source object
 * @param {Array<string>} keys - Keys to omit
 * @returns {object} New object without omitted keys
 */
export const omit = (obj, keys = []) => {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result;
};

/**
 * Pick properties from object
 * @param {object} obj - Source object
 * @param {Array<string>} keys - Keys to pick
 * @returns {object} New object with only picked keys
 */
export const pick = (obj, keys = []) => {
  const result = {};
  keys.forEach((key) => {
    if (obj && Object.hasOwn(obj, key)) {
      result[key] = obj[key];
    }
  });
  return result;
};

/**
 * Merge objects deeply
 * @param {object} target - Target object
 * @param {object} source - Source object
 * @returns {object} Merged object
 */
export const deepMerge = (target, source) => {
  const result = { ...target };

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (
        typeof source[key] === "object" &&
        source[key] !== null &&
        !Array.isArray(source[key])
      ) {
        result[key] = deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }

  return result;
};

/**
 * Group array of objects by key
 * @param {Array} array - Array to group
 * @param {string} key - Key to group by
 * @returns {object} Grouped object
 */
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};

/**
 * Sort array of objects by key
 * @param {Array} array - Array to sort
 * @param {string} key - Key to sort by
 * @param {string} order - Sort order ('asc' | 'desc')
 * @returns {Array} Sorted array
 */
export const sortBy = (array, key, order = "asc") => {
  return [...array].sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];

    if (aValue === bValue) return 0;

    const comparison = aValue > bValue ? 1 : -1;
    return order === "asc" ? comparison : -comparison;
  });
};

/**
 * Remove duplicates from array
 * @param {Array} array - Array to deduplicate
 * @param {string} key - Key to check for duplicates (optional, for array of objects)
 * @returns {Array} Deduplicated array
 */
export const unique = (array, key = null) => {
  if (!key) {
    return [...new Set(array)];
  }

  const seen = new Set();
  return array.filter((item) => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

/**
 * Chunk array into smaller arrays
 * @param {Array} array - Array to chunk
 * @param {number} size - Chunk size
 * @returns {Array} Array of chunks
 */
export const chunk = (array, size) => {
  if (!Array.isArray(array)) {
    throw new TypeError("chunk: First argument must be an array");
  }
  if (typeof size !== "number" || size <= 0 || !Number.isInteger(size)) {
    throw new TypeError("chunk: Size must be a positive integer");
  }
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

/**
 * Flatten nested array
 * @param {Array} array - Array to flatten
 * @param {number} depth - Depth to flatten (default: 1)
 * @returns {Array} Flattened array
 */
export const flatten = (array, depth = 1) => {
  if (depth < 0) {
    throw new RangeError("flatten: Depth must be non-negative");
  }
  if (depth === 0) return array;
  return array.reduce((acc, val) => {
    return acc.concat(Array.isArray(val) ? flatten(val, depth - 1) : val);
  }, []);
};

export default {
  getNestedProperty,
  deepClone,
  isEmpty,
  omit,
  pick,
  deepMerge,
  groupBy,
  sortBy,
  unique,
  chunk,
  flatten,
};
