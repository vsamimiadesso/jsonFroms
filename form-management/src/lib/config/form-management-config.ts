import { InjectionToken } from '@angular/core';

export type FormManagementConfig = {
  headerTitle: string;
};

export function getDefaultFormManagementConfig(): FormManagementConfig {
  return {
    headerTitle: 'form-management',
  };
}

export const FormManagementConfigToken =
  new InjectionToken<FormManagementConfig>('FormManagementConfig', {
    factory: () => getDefaultFormManagementConfig(),
  });
