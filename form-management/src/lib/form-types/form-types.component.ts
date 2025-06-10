import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { InsureComponentsModule } from '@insure/ngx-components';
import { JsonFormsAngularService } from '@jsonforms/angular';

import { JsonFormsInsureControl } from '../base/jsonforms-insure-control';

@Component({
  selector: 'form-management-form-types',
  standalone: true,
  imports: [InsureComponentsModule],
  templateUrl: './form-types.component.html',
  styleUrl: './form-types.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormTypesComponent extends JsonFormsInsureControl {
  constructor() {
    super(inject(JsonFormsAngularService));
    let lastValue = JSON.stringify(this.form.value);
    this.form.valueChanges.subscribe((value) => {
      if (!this.shallowEqual(lastValue, value)) {
        lastValue = value;
        this.onChange({ value: value });
        this.cdr.markForCheck();
      }
    });
  }
}
