import {
  COMMANDS,
  PARAM_SCHEMAS,
  type DeviceCommand,
  type DeviceCommandParams,
  type GeofencePayloadCoordinate,
  type ValidationResult,
} from "./deviceCommandConstants";

export function validateIMEI(imei: string): ValidationResult {
  if (!imei || typeof imei !== "string" || imei.trim() === "") {
    return {
      valid: false,
      error: "IMEI is required and must be a non-empty string",
    };
  }

  if (!/^\d{15}$/.test(imei.trim())) {
    return {
      valid: false,
      error: "IMEI must be exactly 15 digits",
    };
  }

  return { valid: true };
}

export function validateCommand(command: string): ValidationResult {
  const validCommands = Object.values(COMMANDS) as DeviceCommand[];

  if (!validCommands.includes(command as DeviceCommand)) {
    return {
      valid: false,
      error: `Unsupported command type: ${command}. Valid commands are: ${validCommands.join(", ")}`,
    };
  }

  return { valid: true };
}

export function validateParams(
  command: string,
  params: DeviceCommandParams = {},
): ValidationResult {
  if (params && typeof params !== "object") {
    return {
      valid: false,
      error: "Parameters must be an object",
    };
  }

  const paramsObj = params ?? {};

  switch (command) {
    case COMMANDS.SET_CONTACTS:
      return validateSetContactsParams(paramsObj);

    case COMMANDS.SET_GEOFENCE:
      return validateSetGeofenceParams(paramsObj);

    case COMMANDS.DEVICE_SETTINGS:
      return validateDeviceSettingsParams(paramsObj);

    case COMMANDS.FOTA_UPDATE:
      return validateFotaUpdateParams(paramsObj);

    case COMMANDS.STOP_SOS:
    case COMMANDS.QUERY_NORMAL:
    case COMMANDS.QUERY_GEOFENCE:
    case COMMANDS.QUERY_DEVICE_SETTINGS:
    case COMMANDS.CALL_ENABLE:
    case COMMANDS.CALL_DISABLE:
    case COMMANDS.LED_ON:
    case COMMANDS.LED_OFF:
    case COMMANDS.AMBIENT_ENABLE:
    case COMMANDS.AMBIENT_DISABLE:
    case COMMANDS.AMBIENT_STOP:
    case COMMANDS.AIRPLANE_ENABLE:
    case COMMANDS.GPS_DISABLE:
      return { valid: true };

    default:
      return { valid: true };
  }
}

function hasRequiredFields(
  params: DeviceCommandParams,
  requiredFields: readonly string[],
): ValidationResult {
  for (const field of requiredFields) {
    if (!params[field]) {
      return {
        valid: false,
        error: `Missing required field: ${field}`,
      };
    }
  }

  return { valid: true };
}

function validateSetContactsParams(params: DeviceCommandParams): ValidationResult {
  const requiredCheck = hasRequiredFields(params, PARAM_SCHEMAS.SET_CONTACTS);
  if (!requiredCheck.valid) {
    return {
      valid: false,
      error: `SET_CONTACTS ${requiredCheck.error.toLowerCase()}`,
    };
  }

  for (const field of PARAM_SCHEMAS.SET_CONTACTS) {
    const value = params[field];
    if (typeof value !== "string" || value.trim() === "") {
      return {
        valid: false,
        error: `${field} must be a non-empty string`,
      };
    }
  }

  return { valid: true };
}

function validateSetGeofenceParams(params: DeviceCommandParams): ValidationResult {
  const requiredCheck = hasRequiredFields(params, PARAM_SCHEMAS.SET_GEOFENCE);
  if (!requiredCheck.valid) {
    return {
      valid: false,
      error: `SET_GEOFENCE ${requiredCheck.error.toLowerCase()}`,
    };
  }

  if (typeof params.geofence_number !== "string" || params.geofence_number.trim() === "") {
    return {
      valid: false,
      error: "geofence_number must be a non-empty string",
    };
  }

  if (typeof params.geofence_id !== "string" || params.geofence_id.trim() === "") {
    return {
      valid: false,
      error: "geofence_id must be a non-empty string",
    };
  }

  if (!Array.isArray(params.coordinates)) {
    return {
      valid: false,
      error: "coordinates must be an array",
    };
  }

  const coordinates = params.coordinates as GeofencePayloadCoordinate[];

  if (coordinates.length < 3) {
    return {
      valid: false,
      error: "coordinates must contain at least 3 points",
    };
  }

  if (coordinates.length > 5) {
    return {
      valid: false,
      error: "coordinates can contain at most 5 points",
    };
  }

  for (let i = 0; i < coordinates.length; i += 1) {
    const coord = coordinates[i];
    if (!coord || typeof coord !== "object") {
      return {
        valid: false,
        error: `coordinate at index ${i} must be an object`,
      };
    }

    if (
      typeof coord.lat !== "number" ||
      Number.isNaN(coord.lat) ||
      !Number.isFinite(coord.lat)
    ) {
      return {
        valid: false,
        error: `coordinate at index ${i} must have a valid latitude`,
      };
    }

    if (
      typeof coord.lng !== "number" ||
      Number.isNaN(coord.lng) ||
      !Number.isFinite(coord.lng)
    ) {
      return {
        valid: false,
        error: `coordinate at index ${i} must have a valid longitude`,
      };
    }
  }

  return { valid: true };
}

function validateDeviceSettingsParams(params: DeviceCommandParams): ValidationResult {
  if (params.NormalSendingInterval !== undefined) {
    const result = validatePositiveIntegerString(
      params.NormalSendingInterval,
      "NormalSendingInterval",
    );
    if (!result.valid) return result;
  }

  if (params.SOSSendingInterval !== undefined) {
    const result = validatePositiveIntegerString(
      params.SOSSendingInterval,
      "SOSSendingInterval",
    );
    if (!result.valid) return result;
  }

  if (params.NormalScanningInterval !== undefined) {
    const result = validatePositiveIntegerString(
      params.NormalScanningInterval,
      "NormalScanningInterval",
    );
    if (!result.valid) return result;
  }

  if (params.AirplaneInterval !== undefined) {
    const result = validatePositiveIntegerString(
      params.AirplaneInterval,
      "AirplaneInterval",
    );
    if (!result.valid) return result;
  }

  if (params.TemperatureLimit !== undefined) {
    const result = validateNumericString(params.TemperatureLimit, "TemperatureLimit");
    if (!result.valid) return result;
  }

  if (params.SpeedLimit !== undefined) {
    const result = validatePositiveNumericString(params.SpeedLimit, "SpeedLimit");
    if (!result.valid) return result;
  }

  if (params.LowbatLimit !== undefined) {
    const result = validateBatteryLimit(params.LowbatLimit);
    if (!result.valid) return result;
  }

  return { valid: true };
}

function validateFotaUpdateParams(params: DeviceCommandParams): ValidationResult {
  const requiredCheck = hasRequiredFields(params, PARAM_SCHEMAS.FOTA_UPDATE);
  if (!requiredCheck.valid) {
    return {
      valid: false,
      error: `FOTA_UPDATE ${requiredCheck.error.toLowerCase()}`,
    };
  }

  const urlResult = validateURL(params.FOTA);
  if (!urlResult.valid) {
    return {
      valid: false,
      error: `FOTA must be a valid HTTP or HTTPS URL: ${urlResult.error}`,
    };
  }

  if (typeof params.CRC !== "string" || params.CRC.trim() === "") {
    return {
      valid: false,
      error: "CRC must be a non-empty string",
    };
  }

  const sizeResult = validatePositiveIntegerString(params.size, "size");
  if (!sizeResult.valid) return sizeResult;

  if (typeof params.vc !== "string" || params.vc.trim() === "") {
    return {
      valid: false,
      error: "vc must be a non-empty string",
    };
  }

  return { valid: true };
}

function validatePositiveIntegerString(
  value: unknown,
  fieldName: string,
): ValidationResult {
  if (typeof value !== "string") {
    return {
      valid: false,
      error: `${fieldName} must be a string`,
    };
  }

  const num = parseInt(value, 10);

  if (
    Number.isNaN(num) ||
    num <= 0 ||
    !Number.isInteger(num) ||
    num.toString() !== value
  ) {
    return {
      valid: false,
      error: `${fieldName} must be a positive integer string`,
    };
  }

  return { valid: true };
}

function validateNumericString(value: unknown, fieldName: string): ValidationResult {
  if (typeof value !== "string") {
    return {
      valid: false,
      error: `${fieldName} must be a string`,
    };
  }

  const num = parseFloat(value);

  if (Number.isNaN(num)) {
    return {
      valid: false,
      error: `${fieldName} must be a numeric string`,
    };
  }

  return { valid: true };
}

function validatePositiveNumericString(
  value: unknown,
  fieldName: string,
): ValidationResult {
  if (typeof value !== "string") {
    return {
      valid: false,
      error: `${fieldName} must be a string`,
    };
  }

  const num = parseFloat(value);

  if (Number.isNaN(num) || num <= 0) {
    return {
      valid: false,
      error: `${fieldName} must be a positive numeric string`,
    };
  }

  return { valid: true };
}

function validateBatteryLimit(value: unknown): ValidationResult {
  if (typeof value !== "string") {
    return {
      valid: false,
      error: "LowbatLimit must be a string",
    };
  }

  const num = parseFloat(value);

  if (Number.isNaN(num)) {
    return {
      valid: false,
      error: "LowbatLimit must be a numeric string",
    };
  }

  if (num < 0 || num > 100) {
    return {
      valid: false,
      error: "LowbatLimit must be between 0 and 100",
    };
  }

  return { valid: true };
}

function validateURL(value: unknown): ValidationResult {
  if (typeof value !== "string") {
    return {
      valid: false,
      error: "URL must be a string",
    };
  }

  try {
    const url = new URL(value);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return {
        valid: false,
        error: "URL must use HTTP or HTTPS protocol",
      };
    }

    return { valid: true };
  } catch {
    return {
      valid: false,
      error: "Invalid URL format",
    };
  }
}
