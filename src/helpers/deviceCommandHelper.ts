import { API_ENDPOINT } from "./deviceCommandConstants";
import { validateCommand, validateIMEI, validateParams } from "./deviceCommandValidationHelper";
import type {
  DeviceCommandError,
  DeviceCommandRequest,
  DeviceCommandParams,
  DeviceCommandResponse,
} from "./deviceCommandConstants";
import api from "@/lib/axios";

function createValidationError(
  message: string,
  field: "imei" | "command" | "params",
): DeviceCommandError {
  const error = new Error(message) as DeviceCommandError;
  error.code = "VALIDATION_ERROR";
  error.details = { field };
  return error;
}

function createRequest(
  imei: string,
  command: string,
  params: DeviceCommandParams = {},
): DeviceCommandRequest {
  return {
    imei,
    command,
    params,
  };
}

function createTransportError(
  message: string,
  code: DeviceCommandError["code"],
  details?: unknown,
): DeviceCommandError {
  const error = new Error(message) as DeviceCommandError;
  error.code = code;
  error.details = details;
  return error;
}

function normalizeResponse<TData = unknown>(
  response: {
    success?: boolean;
    message?: string;
    data?: TData;
  } & Record<string, unknown>,
): DeviceCommandResponse<TData> {
  return {
    success: response.success !== false,
    message: response.message,
    data: (response.data ?? response) as TData,
  };
}

async function sendRequest<TData = unknown>(
  payload: DeviceCommandRequest,
) {
  try {
    const { data } = await api.post<
      {
        success?: boolean;
        message?: string;
        data?: TData;
      } & Record<string, unknown>
    >(API_ENDPOINT, payload);

    return data;
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error
    ) {
      const axiosError = error as {
        message?: string;
        response?: {
          status?: number;
          data?: { message?: string } & Record<string, unknown>;
        };
      };

      throw createTransportError(
        axiosError.response?.data?.message || axiosError.message || "API request failed",
        "API_ERROR",
        {
          statusCode: axiosError.response?.status,
          response: axiosError.response?.data,
        },
      );
    }

    throw createTransportError("Failed to connect to API endpoint", "NETWORK_ERROR", {
      originalError: error,
    });
  }
}

export async function sendDeviceCommand<TData = unknown>(
  imei: string,
  command: string,
  params: DeviceCommandParams = {},
) {
  const imeiValidation = validateIMEI(imei);
  if (!imeiValidation.valid) {
    throw createValidationError(imeiValidation.error, "imei");
  }

  const commandValidation = validateCommand(command);
  if (!commandValidation.valid) {
    throw createValidationError(commandValidation.error, "command");
  }

  const paramsValidation = validateParams(command, params);
  if (!paramsValidation.valid) {
    throw createValidationError(paramsValidation.error, "params");
  }

  const payload = createRequest(imei, command, params);
  const response = await sendRequest<TData>(payload);
  return normalizeResponse<TData>(response);
}
