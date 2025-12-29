// src/utils/responseValidator.js

/**
 * ResponseValidator - Detects and handles truncated API responses
 */
export class ResponseValidator {
  constructor(options = {}) {
    this.maxResponseSize = options.maxResponseSize || 50 * 1024 * 1024; // 50MB default
    this.minExpectedSize = options.minExpectedSize || 100; // 100 bytes minimum
  }

  /**
   * Validate response completeness and detect truncation
   */
  validateResponse(response, expectedSize = null) {
    const validation = {
      isValid: true,
      isTruncated: false,
      errors: [],
      warnings: [],
      metadata: {
        actualSize: 0,
        expectedSize: expectedSize,
        completionPercentage: 100
      }
    };

    try {
      // Check if response exists
      if (!response) {
        validation.isValid = false;
        validation.errors.push("Response is null or undefined");
        return validation;
      }

      // Convert response to string for analysis
      const responseStr = typeof response === 'string' ? response : JSON.stringify(response);
      validation.metadata.actualSize = responseStr.length;

      // Check for minimum size
      if (responseStr.length < this.minExpectedSize) {
        validation.isValid = false;
        validation.errors.push(`Response too small: ${responseStr.length} bytes (minimum: ${this.minExpectedSize})`);
      }

      // Check for maximum size
      if (responseStr.length > this.maxResponseSize) {
        validation.warnings.push(`Response very large: ${responseStr.length} bytes (max recommended: ${this.maxResponseSize})`);
      }

      // Detect JSON truncation
      const truncationResult = this.detectTruncation(responseStr);
      if (truncationResult.isTruncated) {
        validation.isValid = false;
        validation.isTruncated = true;
        validation.errors.push(...truncationResult.errors);
      }

      // Calculate completion percentage if expected size provided
      if (expectedSize && expectedSize > 0) {
        validation.metadata.completionPercentage = Math.min(100, (responseStr.length / expectedSize) * 100);
        
        if (validation.metadata.completionPercentage < 90) {
          validation.warnings.push(`Response may be incomplete: ${validation.metadata.completionPercentage.toFixed(1)}% of expected size`);
        }
      }

      // Validate JSON structure if response is object
      if (typeof response === 'object') {
        const structureValidation = this.validateJSONStructure(response);
        if (!structureValidation.isValid) {
          validation.isValid = false;
          validation.errors.push(...structureValidation.errors);
        }
      }

    } catch (error) {
      validation.isValid = false;
      validation.errors.push(`Validation error: ${error.message}`);
    }

    return validation;
  }

  /**
   * Detect response truncation indicators
   */
  detectTruncation(responseStr) {
    const result = {
      isTruncated: false,
      errors: [],
      indicators: []
    };

    if (!responseStr || typeof responseStr !== 'string') {
      result.isTruncated = true;
      result.errors.push("Invalid response string");
      return result;
    }

    const trimmed = responseStr.trim();

    // Check for incomplete JSON structure
    if (trimmed.startsWith('{') && !trimmed.endsWith('}')) {
      result.isTruncated = true;
      result.errors.push("JSON object appears truncated - missing closing brace");
      result.indicators.push("incomplete_json_object");
    }

    if (trimmed.startsWith('[') && !trimmed.endsWith(']')) {
      result.isTruncated = true;
      result.errors.push("JSON array appears truncated - missing closing bracket");
      result.indicators.push("incomplete_json_array");
    }

    // Check for abrupt endings (common truncation patterns)
    const suspiciousEndings = [
      /,\s*$/, // Ends with comma
      /:\s*$/, // Ends with colon
      /"\s*$/, // Ends with quote (but not complete string)
      /\{\s*$/, // Ends with opening brace
      /\[\s*$/, // Ends with opening bracket
    ];

    for (const pattern of suspiciousEndings) {
      if (pattern.test(trimmed)) {
        result.isTruncated = true;
        result.errors.push(`Response ends suspiciously: ${pattern.source}`);
        result.indicators.push("suspicious_ending");
        break;
      }
    }

    // Try to parse as JSON to detect structural issues
    try {
      JSON.parse(trimmed);
    } catch (parseError) {
      // Check if it's a truncation-related parse error
      const truncationKeywords = ['unexpected end', 'unterminated', 'incomplete', 'truncated'];
      const errorMessage = parseError.message.toLowerCase();
      
      if (truncationKeywords.some(keyword => errorMessage.includes(keyword))) {
        result.isTruncated = true;
        result.errors.push(`JSON parse error suggests truncation: ${parseError.message}`);
        result.indicators.push("parse_error_truncation");
      }
    }

    return result;
  }

  /**
   * Validate JSON structure for completeness
   */
  validateJSONStructure(jsonObj) {
    const result = {
      isValid: true,
      errors: [],
      warnings: []
    };

    try {
      // Check for GraphQL response structure
      if (jsonObj && typeof jsonObj === 'object') {
        // Check for GraphQL data structure
        if ('data' in jsonObj || 'errors' in jsonObj) {
          // Valid GraphQL response structure
          if (jsonObj.data && Array.isArray(jsonObj.data)) {
            // Check if array seems complete (no null elements at end)
            const data = jsonObj.data;
            if (data.length > 0 && data[data.length - 1] === null) {
              result.warnings.push("Array ends with null - possible truncation");
            }
          }
        }

        // Check for incomplete nested objects
        const incompleteObjects = this.findIncompleteObjects(jsonObj);
        if (incompleteObjects.length > 0) {
          result.isValid = false;
          result.errors.push(`Found ${incompleteObjects.length} incomplete objects`);
        }
      }
    } catch (error) {
      result.isValid = false;
      result.errors.push(`Structure validation error: ${error.message}`);
    }

    return result;
  }

  /**
   * Find objects that appear incomplete (missing expected properties)
   */
  findIncompleteObjects(obj, path = '') {
    const incompleteObjects = [];

    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        if (item && typeof item === 'object') {
          incompleteObjects.push(...this.findIncompleteObjects(item, `${path}[${index}]`));
        }
      });
    } else if (obj && typeof obj === 'object') {
      // Check for objects with only partial properties
      const keys = Object.keys(obj);
      
      // If object has very few properties compared to siblings, it might be incomplete
      if (keys.length === 1 && keys[0] === 'id') {
        incompleteObjects.push({
          path: path,
          reason: 'Object only has id property',
          object: obj
        });
      }

      // Recursively check nested objects
      for (const [key, value] of Object.entries(obj)) {
        if (value && typeof value === 'object') {
          incompleteObjects.push(...this.findIncompleteObjects(value, `${path}.${key}`));
        }
      }
    }

    return incompleteObjects;
  }

  /**
   * Generate a validation report
   */
  generateReport(validation) {
    const report = {
      timestamp: new Date().toISOString(),
      status: validation.isValid ? 'VALID' : 'INVALID',
      summary: {
        isValid: validation.isValid,
        isTruncated: validation.isTruncated,
        errorCount: validation.errors.length,
        warningCount: validation.warnings.length,
        responseSize: validation.metadata.actualSize,
        completionPercentage: validation.metadata.completionPercentage
      },
      details: {
        errors: validation.errors,
        warnings: validation.warnings,
        metadata: validation.metadata
      }
    };

    return report;
  }
}

/**
 * Convenience function for quick validation
 */
export function validateResponse(response, options = {}) {
  const validator = new ResponseValidator(options);
  return validator.validateResponse(response);
}

/**
 * Convenience function for truncation detection
 */
export function detectTruncation(responseStr) {
  const validator = new ResponseValidator();
  return validator.detectTruncation(responseStr);
}