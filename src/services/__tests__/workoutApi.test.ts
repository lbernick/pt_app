import {
  getWorkouts,
  getWorkoutById,
  getWorkoutSuggestions,
  startWorkout,
  finishWorkout,
  cancelWorkout,
  updateWorkoutExercises,
} from '../workoutApi';
import { WorkoutApi, WorkoutExerciseApi } from '../../types/workout';

describe('workoutApi', () => {
  describe('getWorkouts', () => {
    const testBackendUrl = 'http://localhost:8000';

    beforeEach(() => {
      global.fetch = jest.fn();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should fetch workouts from API', async () => {
      const mockResponse = [
        {
          id: '214b3e7e-d595-4e2e-bb9e-7485f0d726bf',
          template_id: '4860c265-da2a-4c34-bcac-c7cbded5471a',
          date: '2025-12-01',
          start_time: null,
          end_time: null,
          exercises: [
            {
              name: 'Bench Press',
              target_sets: 3,
              target_rep_min: 8,
              target_rep_max: 10,
              sets: [
                { reps: 10, weight: 135, rest_seconds: 90, completed: false, notes: null },
                { reps: 8, weight: 145, rest_seconds: 90, completed: false, notes: null },
              ],
              notes: null,
            },
          ],
          created_at: '2025-12-01T09:00:00',
          updated_at: '2025-12-01T09:00:00',
        },
        {
          id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          template_id: '5971e376-eb3b-5d45-cdbd-d8dbefe6421b',
          date: '2025-12-02',
          start_time: null,
          end_time: null,
          exercises: [
            {
              name: 'Squats',
              target_sets: 3,
              target_rep_min: 10,
              target_rep_max: 12,
              sets: [
                { reps: 12, weight: 185, rest_seconds: 120, completed: false, notes: null },
              ],
              notes: null,
            },
          ],
          created_at: '2025-12-02T09:00:00',
          updated_at: '2025-12-02T09:00:00',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getWorkouts(testBackendUrl);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/workouts',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should fetch workouts with date filter', async () => {
      const mockResponse = [
        {
          id: '214b3e7e-d595-4e2e-bb9e-7485f0d726bf',
          template_id: '4860c265-da2a-4c34-bcac-c7cbded5471a',
          date: '2026-03-02',
          start_time: null,
          end_time: null,
          exercises: [
            {
              name: 'Overhead Press',
              target_sets: 3,
              target_rep_min: 8,
              target_rep_max: 10,
              sets: [
                { reps: null, weight: null, rest_seconds: null, completed: false, notes: null },
              ],
              notes: null,
            },
          ],
          created_at: '2025-12-11T00:49:18.299067',
          updated_at: '2025-12-11T00:49:18.299077',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getWorkouts(testBackendUrl, '2026-03-02');

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/workouts?date=2026-03-02',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should return empty array when no workouts exist', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      const result = await getWorkouts(testBackendUrl);

      expect(result).toEqual([]);
    });

    it('should throw an error when the server returns an error response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(getWorkouts(testBackendUrl)).rejects.toThrow(
        'API request failed: 500 Internal Server Error'
      );
    });

    it('should throw an error when network request fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(getWorkouts(testBackendUrl)).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('getWorkoutById', () => {
    const testBackendUrl = 'http://localhost:8000';
    const testWorkoutId = '214b3e7e-d595-4e2e-bb9e-7485f0d726bf';

    beforeEach(() => {
      global.fetch = jest.fn();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should fetch a single workout by ID', async () => {
      const mockResponse = {
        id: testWorkoutId,
        template_id: '4860c265-da2a-4c34-bcac-c7cbded5471a',
        date: '2026-03-02',
        start_time: null,
        end_time: null,
        exercises: [
          {
            name: 'Overhead Press',
            target_sets: 3,
            target_rep_min: 8,
            target_rep_max: 10,
            sets: [
              {
                reps: 10,
                weight: 95,
                rest_seconds: 90,
                completed: false,
                notes: null,
              },
            ],
            notes: null,
          },
        ],
        created_at: '2025-12-11T00:49:18.299067',
        updated_at: '2025-12-11T00:49:18.299077',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getWorkoutById(testBackendUrl, testWorkoutId);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:8000/api/v1/workouts/${testWorkoutId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw an error when workout not found', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(
        getWorkoutById(testBackendUrl, 'invalid-id')
      ).rejects.toThrow('API request failed: 404 Not Found');
    });
  });

  describe('getWorkoutSuggestions', () => {
    const testBackendUrl = 'http://localhost:8000';
    const testWorkoutId = '214b3e7e-d595-4e2e-bb9e-7485f0d726bf';

    beforeEach(() => {
      global.fetch = jest.fn();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should fetch workout suggestions', async () => {
      const mockResponse = {
        exercises: [
          {
            name: 'Bench Press',
            sets: [
              {
                reps: 10,
                weight: 135,
              },
              {
                reps: 8,
                weight: 145,
              },
            ],
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getWorkoutSuggestions(testBackendUrl, testWorkoutId);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:8000/api/v1/workouts/${testWorkoutId}/suggest`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw an error when suggestions fetch fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(
        getWorkoutSuggestions(testBackendUrl, testWorkoutId)
      ).rejects.toThrow('API request failed: 500 Internal Server Error');
    });

    it(
      'should handle timeout/slow response',
      async () => {
        const mockResponse = {
          exercises: [],
        };

        (global.fetch as jest.Mock).mockImplementationOnce(
          () =>
            new Promise((resolve) =>
              setTimeout(
                () =>
                  resolve({
                    ok: true,
                    json: async () => mockResponse,
                  }),
                5000
              )
            )
        );

        // Should still resolve even if slow
        const result = await getWorkoutSuggestions(
          testBackendUrl,
          testWorkoutId
        );
        expect(result.exercises).toEqual([]);
      },
      10000
    ); // 10 second timeout to allow for 5 second delay
  });

  describe('Workout Actions', () => {
    const testBackendUrl = 'http://localhost:8000';
    const testWorkoutId = '214b3e7e-d595-4e2e-bb9e-7485f0d726bf';

    beforeEach(() => {
      global.fetch = jest.fn();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    describe('startWorkout', () => {
      it('should start a workout', async () => {
        const mockResponse = {
          id: testWorkoutId,
          template_id: '4860c265-da2a-4c34-bcac-c7cbded5471a',
          date: '2026-03-02',
          start_time: '2026-03-02T14:30:00',
          end_time: null,
          exercises: [],
          created_at: '2025-12-11T00:49:18.299067',
          updated_at: '2026-03-02T14:30:00',
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

        const result = await startWorkout(testBackendUrl, testWorkoutId);

        expect(global.fetch).toHaveBeenCalledWith(
          `http://localhost:8000/api/v1/workouts/${testWorkoutId}/start`,
          expect.objectContaining({ method: 'POST' })
        );
        expect(result.start_time).toBe('2026-03-02T14:30:00');
        expect(result.end_time).toBeNull();
      });
    });

    describe('finishWorkout', () => {
      it('should finish a workout', async () => {
        const mockResponse = {
          id: testWorkoutId,
          template_id: '4860c265-da2a-4c34-bcac-c7cbded5471a',
          date: '2026-03-02',
          start_time: '2026-03-02T14:30:00',
          end_time: '2026-03-02T15:30:00',
          exercises: [],
          created_at: '2025-12-11T00:49:18.299067',
          updated_at: '2026-03-02T15:30:00',
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

        const result = await finishWorkout(testBackendUrl, testWorkoutId);

        expect(global.fetch).toHaveBeenCalledWith(
          `http://localhost:8000/api/v1/workouts/${testWorkoutId}/finish`,
          expect.objectContaining({ method: 'POST' })
        );
        expect(result.end_time).toBe('2026-03-02T15:30:00');
      });
    });

    describe('cancelWorkout', () => {
      it('should cancel a workout and reset completions', async () => {
        const mockResponse = {
          id: testWorkoutId,
          template_id: '4860c265-da2a-4c34-bcac-c7cbded5471a',
          date: '2026-03-02',
          start_time: null,
          end_time: null,
          exercises: [
            {
              name: 'Bench Press',
              target_sets: 3,
              target_rep_min: 8,
              target_rep_max: 10,
              sets: [
                {
                  reps: 10,
                  weight: 135,
                  rest_seconds: 90,
                  completed: false,
                  notes: null,
                },
              ],
              notes: null,
            },
          ],
          created_at: '2025-12-11T00:49:18.299067',
          updated_at: '2026-03-02T15:30:00',
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

        const result = await cancelWorkout(testBackendUrl, testWorkoutId);

        expect(global.fetch).toHaveBeenCalledWith(
          `http://localhost:8000/api/v1/workouts/${testWorkoutId}/cancel`,
          expect.objectContaining({ method: 'POST' })
        );
        expect(result.start_time).toBeNull();
        expect(result.end_time).toBeNull();
        expect(result.exercises[0].sets[0].completed).toBe(false);
      });
    });

    describe('updateWorkoutExercises', () => {
      it('should update workout exercises with completed sets', async () => {
        const exercisesPayload: WorkoutExerciseApi[] = [
          {
            name: 'Bench Press',
            target_sets: 3,
            target_rep_min: 8,
            target_rep_max: 10,
            sets: [
              {
                reps: 10,
                weight: 135,
                rest_seconds: 90,
                completed: true,
                notes: null,
              },
              {
                reps: 8,
                weight: 145,
                rest_seconds: 90,
                completed: false,
                notes: null,
              },
            ],
            notes: null,
          },
        ];

        const mockResponse: WorkoutApi = {
          id: testWorkoutId,
          template_id: '4860c265-da2a-4c34-bcac-c7cbded5471a',
          date: '2026-03-02',
          start_time: '2026-03-02T14:30:00',
          end_time: null,
          exercises: exercisesPayload,
          created_at: '2025-12-11T00:49:18.299067',
          updated_at: '2026-03-02T14:35:00',
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

        const result = await updateWorkoutExercises(
          testBackendUrl,
          testWorkoutId,
          exercisesPayload
        );

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
          `http://localhost:8000/api/v1/workouts/${testWorkoutId}/exercises`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ exercises: exercisesPayload }),
          }
        );
        expect(result).toEqual(mockResponse);
        expect(result.exercises[0].sets[0].completed).toBe(true);
      });

      it('should update exercises with AI-suggested values', async () => {
        const exercisesPayload: WorkoutExerciseApi[] = [
          {
            name: 'Squats',
            target_sets: 3,
            target_rep_min: 10,
            target_rep_max: 12,
            sets: [
              {
                reps: 12,
                weight: 225,
                rest_seconds: 120,
                completed: true,
                notes: null,
              },
            ],
            notes: null,
          },
        ];

        const mockResponse: WorkoutApi = {
          id: testWorkoutId,
          template_id: '4860c265-da2a-4c34-bcac-c7cbded5471a',
          date: '2026-03-02',
          start_time: '2026-03-02T14:30:00',
          end_time: null,
          exercises: exercisesPayload,
          created_at: '2025-12-11T00:49:18.299067',
          updated_at: '2026-03-02T14:36:00',
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

        const result = await updateWorkoutExercises(
          testBackendUrl,
          testWorkoutId,
          exercisesPayload
        );

        expect(result.exercises[0].sets[0].reps).toBe(12);
        expect(result.exercises[0].sets[0].weight).toBe(225);
      });

      it('should throw an error when update fails', async () => {
        const exercisesPayload: WorkoutExerciseApi[] = [];

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 400,
          statusText: 'Bad Request',
        });

        await expect(
          updateWorkoutExercises(testBackendUrl, testWorkoutId, exercisesPayload)
        ).rejects.toThrow('API request failed: 400 Bad Request');
      });

      it('should throw an error when workout not found', async () => {
        const exercisesPayload: WorkoutExerciseApi[] = [];

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: 'Not Found',
        });

        await expect(
          updateWorkoutExercises(testBackendUrl, 'invalid-id', exercisesPayload)
        ).rejects.toThrow('API request failed: 404 Not Found');
      });

      it('should handle network errors', async () => {
        const exercisesPayload: WorkoutExerciseApi[] = [];

        (global.fetch as jest.Mock).mockRejectedValueOnce(
          new Error('Network error')
        );

        await expect(
          updateWorkoutExercises(testBackendUrl, testWorkoutId, exercisesPayload)
        ).rejects.toThrow('Network error');
      });
    });
  });
});
