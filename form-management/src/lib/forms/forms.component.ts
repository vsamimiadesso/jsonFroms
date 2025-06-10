import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  input,
  InputSignal,
  OnInit,
} from '@angular/core';
import { InsureComponentsModule } from '@insure/ngx-components';
import { JsonFormsAngularService, JsonFormsModule } from '@jsonforms/angular';

import { BooleanComponent, booleanTester } from '../boolean/boolean.component';
import {
  DropdownComponent,
  dropdownTester,
} from '../dropdown/dropdown.component';
import { FormTypesComponent } from '../form-types/form-types.component';
import { insureInputTester } from './insure-input-tester';
import schemaAsset from './schema.json';
import * as test from './uischema.json';
import {
  VerticalLayoutRendererComponent,
  verticalLayoutTester,
} from './vertical';

@Component({
  selector: 'form-management-forms',
  standalone: true,
  imports: [InsureComponentsModule, JsonFormsModule],
  providers: [JsonFormsAngularService],
  templateUrl: './forms.component.html',
  styleUrl: './forms.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormsComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);

  private readonly jsonFormsService = inject(JsonFormsAngularService);

  private readonly http = inject(HttpClient);

  formConfig: any[] = [];

  formReady = false;

  formCompositionId: InputSignal<string> = input.required();

  uischema = test;

  schema = schemaAsset;

  data: any;

  customRenderers: any[] = [
    { tester: insureInputTester, renderer: FormTypesComponent },
    { tester: verticalLayoutTester, renderer: VerticalLayoutRendererComponent },
    { tester: dropdownTester, renderer: DropdownComponent },
    { tester: booleanTester, renderer: BooleanComponent },
  ];

  ngOnInit(): void {
    this.http.get('assets/data.json').subscribe((data: any) => {
      this.data = data;

      this.formReady = true;
      this.cdr.markForCheck();
    });
  }

  onSubmit(): void {
    console.log('Form submitted:', this.data);
    this.isFormValid();
  }

  isFormValid(): void {
    const state = this.jsonFormsService.getState();
    console.log('Form state:', state);
  }

  onError(error: any): void {
    console.error('Error occurred:', error);
  }

  onDataChange(newData: any): void {
    console.log('Data changed:', newData);

    this.data = { ...newData }; // !
    this.cdr.markForCheck();
  }
}
