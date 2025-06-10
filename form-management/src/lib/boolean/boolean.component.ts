import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { InsureComponentsModule } from '@insure/ngx-components';
import { JsonFormsAngularService } from '@jsonforms/angular';
import { rankWith, schemaTypeIs } from '@jsonforms/core';

import { JsonFormsInsureControl } from '../base/jsonforms-insure-control';

@Component({
  selector: 'form-management-boolean',
  standalone: true,
  imports: [InsureComponentsModule],
  templateUrl: './boolean.component.html',
  styleUrl: './boolean.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BooleanComponent extends JsonFormsInsureControl {
  onChanges(): void {
    this.onChange({ value: this.form.value });
  }

  constructor() {
    super(inject(JsonFormsAngularService));
    this.form.valueChanges.subscribe(() => {
      this.cdr.markForCheck();
    });
  }
}

export const booleanTester = rankWith(1, schemaTypeIs('boolean'));
