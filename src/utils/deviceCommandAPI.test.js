/**
 * Unit tests for Device Command API
 * 
 * These tests verify the public API integration with validation and HTTP layers.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendDeviceCommand } from './deviceCommandAPI.js';
import * as validation from './deviceCommandValidation.js';
import * as http from './deviceCommandHTTP.js';

describe('Device Command API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendDeviceCommand', () => {
    it('should validate IMEI before sending request', async () => {
      const validateIMEISpy = vi.spyOn(validation, 'validateIMEI');
      const sendRequestSpy = vi.spyOn(http, 'sendRequest').mockResolvedValue({ success: true });

      await sendDeviceCommand('123456789012345', 'STOP_SOS');

      expect(validateIMEISpy).toHaveBeenCalledWith('123456789012345');
      expect(sendRequestSpy).toHaveBeenCalled();
    });

    it('should throw VALIDATION_ERROR when IMEI is invalid', async () => {
      await expect(
        sendDeviceCommand('', 'STOP_SOS')
      ).rejects.toMatchObject({
        code: 'VALIDATION_ERROR',
        details: { field: 'imei' }
      });
    });

    it('should validate command type before sending request', async () => {
      const validateCommandSpy = vi.spyOn(validation, 'validateCommand');
      const sendRequestSpy = vi.spyOn(http, 'sendRequest').mockResolvedValue({ success: true });

      await sendDeviceCommand('123456789012345', 'STOP_SOS');

      expect(validateCommandSpy).toHaveBeenCalledWith('STOP_SOS');
      expect(sendRequestSpy).toHaveBeenCalled();
    });

    it('should throw VALIDATION_ERROR when command is invalid', async () => {
      await expect(
        sendDeviceCommand('123456789012345', 'INVALID_COMMAND')
      ).rejects.toMatchObject({
        code: 'VALIDATION_ERROR',
        details: { field: 'command' }
      });
    });

    it('should validate params before sending request', async () => {
      const validateParamsSpy = vi.spyOn(validation, 'validateParams');
      const sendRequestSpy = vi.spyOn(http, 'sendRequest').mockResolvedValue({ success: true });

      const params = {
        phonenum1: '+1234567890',
        phonenum2: '+0987654321',
        controlroomnum: '+1122334455'
      };

      await sendDeviceCommand('123456789012345', 'SET_CONTACTS', params);

      expect(validateParamsSpy).toHaveBeenCalledWith('SET_CONTACTS', params);
      expect(sendRequestSpy).toHaveBeenCalled();
    });

    it('should throw VALIDATION_ERROR when params are invalid', async () => {
      await expect(
        sendDeviceCommand('123456789012345', 'SET_CONTACTS', { phonenum1: '+123' })
      ).rejects.toMatchObject({
        code: 'VALIDATION_ERROR',
        details: { field: 'params' }
      });
    });

    it('should format request with IMEI, command, and params', async () => {
      const formatRequestSpy = vi.spyOn(http, 'formatRequest');
      const sendRequestSpy = vi.spyOn(http, 'sendRequest').mockResolvedValue({ success: true });

      const params = { phonenum1: '+123', phonenum2: '+456', controlroomnum: '+789' };
      await sendDeviceCommand('123456789012345', 'SET_CONTACTS', params);

      expect(formatRequestSpy).toHaveBeenCalledWith('123456789012345', 'SET_CONTACTS', params);
      expect(sendRequestSpy).toHaveBeenCalled();
    });

    it('should send request to API after validation', async () => {
      const sendRequestSpy = vi.spyOn(http, 'sendRequest').mockResolvedValue({ success: true });

      await sendDeviceCommand('123456789012345', 'STOP_SOS');

      expect(sendRequestSpy).toHaveBeenCalledWith({
        imei: '123456789012345',
        command: 'STOP_SOS',
        params: {}
      });
    });

    it('should handle response and return normalized data', async () => {
      const mockResponse = { success: true, message: 'Command sent' };
      vi.spyOn(http, 'sendRequest').mockResolvedValue(mockResponse);
      const handleResponseSpy = vi.spyOn(http, 'handleResponse');

      const result = await sendDeviceCommand('123456789012345', 'STOP_SOS');

      expect(handleResponseSpy).toHaveBeenCalledWith(mockResponse);
      expect(result).toEqual({
        success: true,
        message: 'Command sent',
        data: mockResponse
      });
    });

    it('should propagate API errors', async () => {
      const apiError = new Error('API Error');
      apiError.code = 'API_ERROR';
      apiError.details = { statusCode: 500 };

      vi.spyOn(http, 'sendRequest').mockRejectedValue(apiError);

      await expect(
        sendDeviceCommand('123456789012345', 'STOP_SOS')
      ).rejects.toMatchObject({
        code: 'API_ERROR',
        details: { statusCode: 500 }
      });
    });

    it('should propagate network errors', async () => {
      const networkError = new Error('Network Error');
      networkError.code = 'NETWORK_ERROR';

      vi.spyOn(http, 'sendRequest').mockRejectedValue(networkError);

      await expect(
        sendDeviceCommand('123456789012345', 'STOP_SOS')
      ).rejects.toMatchObject({
        code: 'NETWORK_ERROR'
      });
    });

    it('should use empty object as default params', async () => {
      const sendRequestSpy = vi.spyOn(http, 'sendRequest').mockResolvedValue({ success: true });

      await sendDeviceCommand('123456789012345', 'STOP_SOS');

      expect(sendRequestSpy).toHaveBeenCalledWith({
        imei: '123456789012345',
        command: 'STOP_SOS',
        params: {}
      });
    });

    it('should return a Promise', () => {
      vi.spyOn(http, 'sendRequest').mockResolvedValue({ success: true });

      const result = sendDeviceCommand('123456789012345', 'STOP_SOS');

      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('Command Type Tests', () => {
    beforeEach(() => {
      vi.spyOn(http, 'sendRequest').mockResolvedValue({ success: true, message: 'Command sent' });
    });

    describe('STOP_SOS command', () => {
      it('should send STOP_SOS command with empty params', async () => {
        const sendRequestSpy = vi.spyOn(http, 'sendRequest').mockResolvedValue({ success: true });

        await sendDeviceCommand('123456789012345', 'STOP_SOS');

        expect(sendRequestSpy).toHaveBeenCalledWith({
          imei: '123456789012345',
          command: 'STOP_SOS',
          params: {}
        });
      });

      it('should successfully execute STOP_SOS command', async () => {
        const result = await sendDeviceCommand('123456789012345', 'STOP_SOS');

        expect(result).toMatchObject({
          success: true,
          message: 'Command sent'
        });
      });
    });

    describe('QUERY_NORMAL command', () => {
      it('should send QUERY_NORMAL command with empty params', async () => {
        const sendRequestSpy = vi.spyOn(http, 'sendRequest').mockResolvedValue({ success: true });

        await sendDeviceCommand('123456789012345', 'QUERY_NORMAL');

        expect(sendRequestSpy).toHaveBeenCalledWith({
          imei: '123456789012345',
          command: 'QUERY_NORMAL',
          params: {}
        });
      });

      it('should successfully execute QUERY_NORMAL command', async () => {
        const result = await sendDeviceCommand('123456789012345', 'QUERY_NORMAL');

        expect(result).toMatchObject({
          success: true,
          message: 'Command sent'
        });
      });
    });

    describe('QUERY_DEVICE_SETTINGS command', () => {
      it('should send QUERY_DEVICE_SETTINGS command with empty params', async () => {
        const sendRequestSpy = vi.spyOn(http, 'sendRequest').mockResolvedValue({ success: true });

        await sendDeviceCommand('123456789012345', 'QUERY_DEVICE_SETTINGS');

        expect(sendRequestSpy).toHaveBeenCalledWith({
          imei: '123456789012345',
          command: 'QUERY_DEVICE_SETTINGS',
          params: {}
        });
      });

      it('should successfully execute QUERY_DEVICE_SETTINGS command', async () => {
        const result = await sendDeviceCommand('123456789012345', 'QUERY_DEVICE_SETTINGS');

        expect(result).toMatchObject({
          success: true,
          message: 'Command sent'
        });
      });
    });

    describe('SET_CONTACTS command', () => {
      const contactParams = {
        phonenum1: '+1234567890',
        phonenum2: '+0987654321',
        controlroomnum: '+1122334455'
      };

      it('should send SET_CONTACTS command with contact parameters', async () => {
        const sendRequestSpy = vi.spyOn(http, 'sendRequest').mockResolvedValue({ success: true });

        await sendDeviceCommand('123456789012345', 'SET_CONTACTS', contactParams);

        expect(sendRequestSpy).toHaveBeenCalledWith({
          imei: '123456789012345',
          command: 'SET_CONTACTS',
          params: contactParams
        });
      });

      it('should successfully execute SET_CONTACTS command', async () => {
        const result = await sendDeviceCommand('123456789012345', 'SET_CONTACTS', contactParams);

        expect(result).toMatchObject({
          success: true,
          message: 'Command sent'
        });
      });

      it('should include all three phone numbers in params', async () => {
        const sendRequestSpy = vi.spyOn(http, 'sendRequest').mockResolvedValue({ success: true });

        await sendDeviceCommand('123456789012345', 'SET_CONTACTS', contactParams);

        const callArgs = sendRequestSpy.mock.calls[0][0];
        expect(callArgs.params).toHaveProperty('phonenum1', '+1234567890');
        expect(callArgs.params).toHaveProperty('phonenum2', '+0987654321');
        expect(callArgs.params).toHaveProperty('controlroomnum', '+1122334455');
      });
    });

    describe('SET_GEOFENCE command', () => {
      const geofenceParams = {
        geofence_number: '1',
        geofence_id: 'zone-alpha',
        coordinates: [
          { latitude: 37.7749, longitude: -122.4194 },
          { latitude: 37.7849, longitude: -122.4094 },
          { latitude: 37.7649, longitude: -122.4094 },
          { latitude: 37.7749, longitude: -122.4194 }
        ]
      };

      it('should send SET_GEOFENCE command with geofence parameters', async () => {
        const sendRequestSpy = vi.spyOn(http, 'sendRequest').mockResolvedValue({ success: true });

        await sendDeviceCommand('123456789012345', 'SET_GEOFENCE', geofenceParams);

        expect(sendRequestSpy).toHaveBeenCalledWith({
          imei: '123456789012345',
          command: 'SET_GEOFENCE',
          params: geofenceParams
        });
      });

      it('should successfully execute SET_GEOFENCE command', async () => {
        const result = await sendDeviceCommand('123456789012345', 'SET_GEOFENCE', geofenceParams);

        expect(result).toMatchObject({
          success: true,
          message: 'Command sent'
        });
      });

      it('should include geofence_number, geofence_id, and coordinates', async () => {
        const sendRequestSpy = vi.spyOn(http, 'sendRequest').mockResolvedValue({ success: true });

        await sendDeviceCommand('123456789012345', 'SET_GEOFENCE', geofenceParams);

        const callArgs = sendRequestSpy.mock.calls[0][0];
        expect(callArgs.params).toHaveProperty('geofence_number', '1');
        expect(callArgs.params).toHaveProperty('geofence_id', 'zone-alpha');
        expect(callArgs.params).toHaveProperty('coordinates');
        expect(callArgs.params.coordinates).toHaveLength(4);
      });
    });

    describe('DEVICE_SETTINGS command', () => {
      const settingsParams = {
        NormalSendingInterval: '300',
        SOSSendingInterval: '60',
        NormalScanningInterval: '120',
        AirplaneInterval: '600',
        TemperatureLimit: '50',
        SpeedLimit: '120',
        LowbatLimit: '20'
      };

      it('should send DEVICE_SETTINGS command with settings parameters', async () => {
        const sendRequestSpy = vi.spyOn(http, 'sendRequest').mockResolvedValue({ success: true });

        await sendDeviceCommand('123456789012345', 'DEVICE_SETTINGS', settingsParams);

        expect(sendRequestSpy).toHaveBeenCalledWith({
          imei: '123456789012345',
          command: 'DEVICE_SETTINGS',
          params: settingsParams
        });
      });

      it('should successfully execute DEVICE_SETTINGS command', async () => {
        const result = await sendDeviceCommand('123456789012345', 'DEVICE_SETTINGS', settingsParams);

        expect(result).toMatchObject({
          success: true,
          message: 'Command sent'
        });
      });

      it('should include all provided settings in params', async () => {
        const sendRequestSpy = vi.spyOn(http, 'sendRequest').mockResolvedValue({ success: true });

        await sendDeviceCommand('123456789012345', 'DEVICE_SETTINGS', settingsParams);

        const callArgs = sendRequestSpy.mock.calls[0][0];
        expect(callArgs.params).toHaveProperty('NormalSendingInterval', '300');
        expect(callArgs.params).toHaveProperty('SOSSendingInterval', '60');
        expect(callArgs.params).toHaveProperty('TemperatureLimit', '50');
        expect(callArgs.params).toHaveProperty('SpeedLimit', '120');
        expect(callArgs.params).toHaveProperty('LowbatLimit', '20');
      });

      it('should accept partial settings parameters', async () => {
        const partialSettings = {
          NormalSendingInterval: '300',
          LowbatLimit: '15'
        };

        const sendRequestSpy = vi.spyOn(http, 'sendRequest').mockResolvedValue({ success: true });

        await sendDeviceCommand('123456789012345', 'DEVICE_SETTINGS', partialSettings);

        const callArgs = sendRequestSpy.mock.calls[0][0];
        expect(callArgs.params).toHaveProperty('NormalSendingInterval', '300');
        expect(callArgs.params).toHaveProperty('LowbatLimit', '15');
      });
    });

    describe('Feature toggle commands', () => {
      describe('CALL_ENABLE command', () => {
        it('should send CALL_ENABLE command with empty params', async () => {
          const sendRequestSpy = vi.spyOn(http, 'sendRequest').mockResolvedValue({ success: true });

          await sendDeviceCommand('123456789012345', 'CALL_ENABLE');

          expect(sendRequestSpy).toHaveBeenCalledWith({
            imei: '123456789012345',
            command: 'CALL_ENABLE',
            params: {}
          });
        });

        it('should successfully execute CALL_ENABLE command', async () => {
          const result = await sendDeviceCommand('123456789012345', 'CALL_ENABLE');

          expect(result).toMatchObject({
            success: true,
            message: 'Command sent'
          });
        });
      });

      describe('CALL_DISABLE command', () => {
        it('should send CALL_DISABLE command with empty params', async () => {
          const sendRequestSpy = vi.spyOn(http, 'sendRequest').mockResolvedValue({ success: true });

          await sendDeviceCommand('123456789012345', 'CALL_DISABLE');

          expect(sendRequestSpy).toHaveBeenCalledWith({
            imei: '123456789012345',
            command: 'CALL_DISABLE',
            params: {}
          });
        });

        it('should successfully execute CALL_DISABLE command', async () => {
          const result = await sendDeviceCommand('123456789012345', 'CALL_DISABLE');

          expect(result).toMatchObject({
            success: true,
            message: 'Command sent'
          });
        });
      });

      describe('LED_ON command', () => {
        it('should send LED_ON command with empty params', async () => {
          const sendRequestSpy = vi.spyOn(http, 'sendRequest').mockResolvedValue({ success: true });

          await sendDeviceCommand('123456789012345', 'LED_ON');

          expect(sendRequestSpy).toHaveBeenCalledWith({
            imei: '123456789012345',
            command: 'LED_ON',
            params: {}
          });
        });

        it('should successfully execute LED_ON command', async () => {
          const result = await sendDeviceCommand('123456789012345', 'LED_ON');

          expect(result).toMatchObject({
            success: true,
            message: 'Command sent'
          });
        });
      });

      describe('LED_OFF command', () => {
        it('should send LED_OFF command with empty params', async () => {
          const sendRequestSpy = vi.spyOn(http, 'sendRequest').mockResolvedValue({ success: true });

          await sendDeviceCommand('123456789012345', 'LED_OFF');

          expect(sendRequestSpy).toHaveBeenCalledWith({
            imei: '123456789012345',
            command: 'LED_OFF',
            params: {}
          });
        });

        it('should successfully execute LED_OFF command', async () => {
          const result = await sendDeviceCommand('123456789012345', 'LED_OFF');

          expect(result).toMatchObject({
            success: true,
            message: 'Command sent'
          });
        });
      });

      describe('AMBIENT_ENABLE command', () => {
        it('should send AMBIENT_ENABLE command with empty params', async () => {
          const sendRequestSpy = vi.spyOn(http, 'sendRequest').mockResolvedValue({ success: true });

          await sendDeviceCommand('123456789012345', 'AMBIENT_ENABLE');

          expect(sendRequestSpy).toHaveBeenCalledWith({
            imei: '123456789012345',
            command: 'AMBIENT_ENABLE',
            params: {}
          });
        });

        it('should successfully execute AMBIENT_ENABLE command', async () => {
          const result = await sendDeviceCommand('123456789012345', 'AMBIENT_ENABLE');

          expect(result).toMatchObject({
            success: true,
            message: 'Command sent'
          });
        });
      });

      describe('AMBIENT_DISABLE command', () => {
        it('should send AMBIENT_DISABLE command with empty params', async () => {
          const sendRequestSpy = vi.spyOn(http, 'sendRequest').mockResolvedValue({ success: true });

          await sendDeviceCommand('123456789012345', 'AMBIENT_DISABLE');

          expect(sendRequestSpy).toHaveBeenCalledWith({
            imei: '123456789012345',
            command: 'AMBIENT_DISABLE',
            params: {}
          });
        });

        it('should successfully execute AMBIENT_DISABLE command', async () => {
          const result = await sendDeviceCommand('123456789012345', 'AMBIENT_DISABLE');

          expect(result).toMatchObject({
            success: true,
            message: 'Command sent'
          });
        });
      });

      describe('AMBIENT_STOP command', () => {
        it('should send AMBIENT_STOP command with empty params', async () => {
          const sendRequestSpy = vi.spyOn(http, 'sendRequest').mockResolvedValue({ success: true });

          await sendDeviceCommand('123456789012345', 'AMBIENT_STOP');

          expect(sendRequestSpy).toHaveBeenCalledWith({
            imei: '123456789012345',
            command: 'AMBIENT_STOP',
            params: {}
          });
        });

        it('should successfully execute AMBIENT_STOP command', async () => {
          const result = await sendDeviceCommand('123456789012345', 'AMBIENT_STOP');

          expect(result).toMatchObject({
            success: true,
            message: 'Command sent'
          });
        });
      });

      describe('AIRPLANE_ENABLE command', () => {
        it('should send AIRPLANE_ENABLE command with empty params', async () => {
          const sendRequestSpy = vi.spyOn(http, 'sendRequest').mockResolvedValue({ success: true });

          await sendDeviceCommand('123456789012345', 'AIRPLANE_ENABLE');

          expect(sendRequestSpy).toHaveBeenCalledWith({
            imei: '123456789012345',
            command: 'AIRPLANE_ENABLE',
            params: {}
          });
        });

        it('should successfully execute AIRPLANE_ENABLE command', async () => {
          const result = await sendDeviceCommand('123456789012345', 'AIRPLANE_ENABLE');

          expect(result).toMatchObject({
            success: true,
            message: 'Command sent'
          });
        });
      });

      describe('GPS_DISABLE command', () => {
        it('should send GPS_DISABLE command with empty params', async () => {
          const sendRequestSpy = vi.spyOn(http, 'sendRequest').mockResolvedValue({ success: true });

          await sendDeviceCommand('123456789012345', 'GPS_DISABLE');

          expect(sendRequestSpy).toHaveBeenCalledWith({
            imei: '123456789012345',
            command: 'GPS_DISABLE',
            params: {}
          });
        });

        it('should successfully execute GPS_DISABLE command', async () => {
          const result = await sendDeviceCommand('123456789012345', 'GPS_DISABLE');

          expect(result).toMatchObject({
            success: true,
            message: 'Command sent'
          });
        });
      });
    });

    describe('FOTA_UPDATE command', () => {
      const fotaParams = {
        FOTA: 'https://firmware.example.com/device-v2.1.0.bin',
        CRC: 'a3f5e8d9c2b1',
        size: '2048576',
        vc: 'v2.1.0'
      };

      it('should send FOTA_UPDATE command with firmware parameters', async () => {
        const sendRequestSpy = vi.spyOn(http, 'sendRequest').mockResolvedValue({ success: true });

        await sendDeviceCommand('123456789012345', 'FOTA_UPDATE', fotaParams);

        expect(sendRequestSpy).toHaveBeenCalledWith({
          imei: '123456789012345',
          command: 'FOTA_UPDATE',
          params: fotaParams
        });
      });

      it('should successfully execute FOTA_UPDATE command', async () => {
        const result = await sendDeviceCommand('123456789012345', 'FOTA_UPDATE', fotaParams);

        expect(result).toMatchObject({
          success: true,
          message: 'Command sent'
        });
      });

      it('should include FOTA, CRC, size, and vc in params', async () => {
        const sendRequestSpy = vi.spyOn(http, 'sendRequest').mockResolvedValue({ success: true });

        await sendDeviceCommand('123456789012345', 'FOTA_UPDATE', fotaParams);

        const callArgs = sendRequestSpy.mock.calls[0][0];
        expect(callArgs.params).toHaveProperty('FOTA', 'https://firmware.example.com/device-v2.1.0.bin');
        expect(callArgs.params).toHaveProperty('CRC', 'a3f5e8d9c2b1');
        expect(callArgs.params).toHaveProperty('size', '2048576');
        expect(callArgs.params).toHaveProperty('vc', 'v2.1.0');
      });
    });
  });
});
