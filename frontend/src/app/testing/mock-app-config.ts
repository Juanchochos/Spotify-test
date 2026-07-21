import { AppConfig } from '../core/app-config';

export const mockAppConfig: AppConfig = {
  production: false,
  apiBaseUrl: 'http://test-api.example.com/api',
  spotifyClientId: 'test-client-id',
  spotifyRedirectUri: 'http://127.0.0.1:5173/spotify-user',
};
