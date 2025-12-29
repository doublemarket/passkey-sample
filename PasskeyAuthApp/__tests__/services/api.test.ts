jest.mock('axios', () => {
  const post = jest.fn();
  const get = jest.fn();
  return {
    __esModule: true,
    default: {
      create: () => ({
        post,
        get,
      }),
    },
    __mocks: {
      post,
      get,
    },
  };
});

jest.mock('../../src/config/localConfig', () => ({
  getMobileConfig: () => ({ apiBaseUrl: 'http://test.local' }),
}));

const axiosMock = require('axios');
const { authApi, passkeyApi, API_BASE_URL } = require('../../src/services/api');

beforeEach(() => {
  axiosMock.__mocks.post.mockReset();
  axiosMock.__mocks.get.mockReset();
});

test('API_BASE_URL uses local config', () => {
  expect(API_BASE_URL).toBe('http://test.local');
});

test('authApi.register returns response data on success', async () => {
  axiosMock.__mocks.post.mockResolvedValueOnce({ data: { success: true } });

  const result = await authApi.register({
    username: 'user',
    password: 'password123',
  });

  expect(result).toEqual({ success: true });
});

test('authApi.register returns response data on API error', async () => {
  axiosMock.__mocks.post.mockRejectedValueOnce({
    response: { data: { success: false, message: 'error' } },
  });

  const result = await authApi.register({
    username: 'user',
    password: 'password123',
  });

  expect(result).toEqual({ success: false, message: 'error' });
});

test('passkeyApi.registerStart throws message from server response', async () => {
  axiosMock.__mocks.post.mockRejectedValueOnce({
    response: { data: { message: 'passkey error' } },
  });

  await expect(passkeyApi.registerStart('user')).rejects.toThrow(
    'passkey error'
  );
});
