import { sendMessage } from '../chatApi';

describe('chatApi', () => {
  describe('sendMessage', () => {
    const testApiUrl = 'http://localhost:8000/api/v1/chat';

    beforeEach(() => {
      global.fetch = jest.fn();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should send messages in the correct format and return assistant response', async () => {
      const mockResponse = {
        role: 'assistant',
        content: 'Hello! How can I help you today?',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const messages = [
        { role: 'user', content: 'Hello' },
      ];

      const result = await sendMessage(messages, testApiUrl);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        testApiUrl,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ messages }),
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle multiple messages in conversation', async () => {
      const mockResponse = {
        role: 'assistant',
        content: 'I can help you with that!',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const messages = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' },
        { role: 'user', content: 'Can you help me?' },
      ];

      const result = await sendMessage(messages, testApiUrl);

      expect(global.fetch).toHaveBeenCalledWith(
        testApiUrl,
        expect.objectContaining({
          body: JSON.stringify({ messages }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw an error when the server returns an error response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const messages = [
        { role: 'user', content: 'Hello' },
      ];

      await expect(sendMessage(messages, testApiUrl)).rejects.toThrow(
        'Failed to get response: 500 Internal Server Error'
      );
    });

    it('should throw an error when the server returns a 400 error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      });

      const messages = [
        { role: 'user', content: 'Hello' },
      ];

      await expect(sendMessage(messages, testApiUrl)).rejects.toThrow(
        'Failed to get response: 400 Bad Request'
      );
    });

    it('should throw an error when network request fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      const messages = [
        { role: 'user', content: 'Hello' },
      ];

      await expect(sendMessage(messages, testApiUrl)).rejects.toThrow('Network error');
    });

    it('should handle empty response content', async () => {
      const mockResponse = {
        role: 'assistant',
        content: '',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const messages = [
        { role: 'user', content: 'Hello' },
      ];

      const result = await sendMessage(messages, testApiUrl);

      expect(result).toEqual(mockResponse);
      expect(result.content).toBe('');
    });
  });
});
