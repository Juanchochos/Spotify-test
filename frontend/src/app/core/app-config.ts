import { InjectionToken } from '@angular/core';

export interface AppConfig {
  production: boolean;
  apiBaseUrl: string;
  spotifyClientId: string;
  spotifyRedirectUri: string;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');
