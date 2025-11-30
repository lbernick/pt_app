import { generateWorkout } from '../workoutApi';

describe('workoutApi', () => {
  describe('generateWorkout', () => {
    const testApiUrl = 'http://localhost:8000/api/v1/generate-workout';

    beforeEach(() => {
      global.fetch = jest.fn();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should send workout request and return Workout', async () => {
      const mockResponse = {
        exercises: [
          {
            exercise: { name: 'Push-ups' },
            sets: [
              { reps: 10, rest_seconds: 60 },
              { reps: 10, rest_seconds: 60 },
            ],
          },
          {
            exercise: { name: 'Squats' },
            sets: [
              { reps: 15, weight: 135, rest_seconds: 90 },
              { reps: 12, weight: 135, rest_seconds: 90 },
            ],
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const request = {
        prompt: 'Upper body strength',
        difficulty: 'intermediate',
        duration_minutes: 30,
      };

      const result = await generateWorkout(request, testApiUrl);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(testApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle request without duration_minutes', async () => {
      const mockResponse = {
        exercises: [
          {
            exercise: { name: 'Pull-ups' },
            sets: [{ reps: 8, rest_seconds: 90 }],
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const request = {
        prompt: 'Back workout',
        difficulty: 'advanced',
      };

      const result = await generateWorkout(request, testApiUrl);

      expect(global.fetch).toHaveBeenCalledWith(
        testApiUrl,
        expect.objectContaining({
          body: JSON.stringify(request),
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

      const request = {
        prompt: 'Leg day',
        difficulty: 'beginner',
      };

      await expect(generateWorkout(request, testApiUrl)).rejects.toThrow(
        'Failed to generate workout: 500 Internal Server Error'
      );
    });

    it('should throw an error when the server returns a 400 error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      });

      const request = {
        prompt: '',
        difficulty: 'beginner',
      };

      await expect(generateWorkout(request, testApiUrl)).rejects.toThrow(
        'Failed to generate workout: 400 Bad Request'
      );
    });

    it('should throw an error when network request fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      const request = {
        prompt: 'Full body',
        difficulty: 'intermediate',
      };

      await expect(generateWorkout(request, testApiUrl)).rejects.toThrow(
        'Network error'
      );
    });
  });
});
