import { getAuthHeaders } from './authHeaders';
import {
  clearAccessToken,
  setAccessToken,
} from './tokenStorage';

describe('getAuthHeaders', () => {
  beforeEach(() => {
    clearAccessToken();
  });

  it('returns no authorization header without an access token', () => {
    expect(getAuthHeaders()).toEqual({});
  });

  it('returns a bearer authorization header for the active access token', () => {
    setAccessToken('stored-token');

    expect(getAuthHeaders()).toEqual({
      Authorization: 'Bearer stored-token',
    });
  });
});
