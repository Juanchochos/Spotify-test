import { EnvironmentProviders, Provider } from '@angular/core';
import { provideRouter } from '@angular/router';
import { APP_CONFIG, AppConfig } from '../core/app-config';
import { mockAppConfig } from './mock-app-config';

export function provideTestProviders(
  config: AppConfig = mockAppConfig,
): (Provider | EnvironmentProviders)[] {
  return [provideRouter([]), { provide: APP_CONFIG, useValue: config }];
}
