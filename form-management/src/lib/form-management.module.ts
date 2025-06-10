import { APP_INITIALIZER, ModuleWithProviders, NgModule } from '@angular/core';
import {
  InsureComponentsModule,
  InsureTranslationService,
} from '@insure/ngx-components';
import { customInsureConfig } from '@insure-iwp/shared';

import {
  FormManagementConfig,
  FormManagementConfigToken,
  getDefaultFormManagementConfig,
} from './config/form-management-config';
import {
  IwpFormManagementApiConfiguration,
  IwpFormManagementApiModule,
} from './generated/form-management-api';

@NgModule({
  declarations: [],
  imports: [
    InsureComponentsModule.forRoot(customInsureConfig),
    IwpFormManagementApiModule.forRoot(() => {
      return new IwpFormManagementApiConfiguration({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        basePath:
          // eslint-disable-next-line prettier/prettier, @typescript-eslint/ban-ts-comment
          // @ts-ignore
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          FORM_MANAGEMENT_CONFIG.formManagementServicesUrl || '',
      });
    }),
  ],
  providers: [
    {
      provide: FormManagementConfigToken,
      useValue: getDefaultFormManagementConfig(),
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (insureTranslationService: InsureTranslationService) => () =>
        insureTranslationService.addTranslationsByPath(
          'assets/form-management-i18n/',
          ['de', 'en'],
        ),
      deps: [InsureTranslationService],
      multi: true,
    },
  ],
})
export class FormManagementModule {
  static forRoot(
    config: FormManagementConfig,
  ): ModuleWithProviders<FormManagementModule> {
    return {
      ngModule: FormManagementModule,
      providers: [
        {
          provide: FormManagementConfigToken,
          useValue: config,
        },
      ],
    };
  }
}
