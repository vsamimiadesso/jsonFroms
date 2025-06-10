import { NgModule, ModuleWithProviders, SkipSelf, Optional } from '@angular/core';
import { IwpFormManagementApiConfiguration } from './configuration';
import { HttpClient } from '@angular/common/http';

import { FormsService } from './api/forms.service';

@NgModule({
  imports:      [],
  declarations: [],
  exports:      [],
  providers: []
})
export class IwpFormManagementApiModule {
    public static forRoot(configurationFactory: () => IwpFormManagementApiConfiguration): ModuleWithProviders<IwpFormManagementApiModule> {
        return {
            ngModule: IwpFormManagementApiModule,
            providers: [ { provide: IwpFormManagementApiConfiguration, useFactory: configurationFactory } ]
        };
    }

    constructor( @Optional() @SkipSelf() parentModule: IwpFormManagementApiModule,
                 @Optional() http: HttpClient) {
        if (parentModule) {
            throw new Error('IwpFormManagementApiModule is already loaded. Import in your base AppModule only.');
        }
        if (!http) {
            throw new Error('You need to import the HttpClientModule in your AppModule! \n' +
            'See also https://github.com/angular/angular/issues/20575');
        }
    }
}
