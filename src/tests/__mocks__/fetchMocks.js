/**
 * Shared fetch mocks for tests when features call `fetch` directly.
 * This shell prefers `src/mockBackend` + helpers; extend this as you add HTTP clients.
 */

export function createDefaultFetchMock() {
  return (url) => {
    return Promise.resolve({
      ok: false,
      status: 404,
      json: async () => ({ error: 'Endpoint not mocked' }),
    });
  };
}
