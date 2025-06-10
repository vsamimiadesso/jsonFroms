import {
  ChangeDetectionStrategy,
  Component,
  computed,
  OnInit,
  Signal,
} from '@angular/core';
import { InsureComponentsModule, SelectItem } from '@insure/ngx-components';
import { isEnumControl, rankWith } from '@jsonforms/core';

import { JsonFormsInsureControl } from '../base/jsonforms-insure-control';

@Component({
  selector: 'form-management-dropdown',
  standalone: true,
  imports: [InsureComponentsModule],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownComponent
  extends JsonFormsInsureControl
  implements OnInit
{
  onChanges(event: SelectItem): void {
    this.onChange({ value: event.value });
  }

  enumOptions: Signal<SelectItem[]> = computed(() => {
    const items = this.scopedSchema.enum ?? [];
    return items.map((item: string) => ({
      label: item,
      value: item,
    }));
  });

  override ngOnInit(): void {
    super.ngOnInit();
    this.cdr.markForCheck();
  }
}
export const dropdownTester = rankWith(2, isEnumControl);
