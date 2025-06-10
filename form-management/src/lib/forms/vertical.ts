// vertical-layout.renderer.ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { InsureComponentsModule } from '@insure/ngx-components';
import { JsonFormsBaseRenderer, JsonFormsModule } from '@jsonforms/angular';
import { rankWith, uiTypeIs, VerticalLayout } from '@jsonforms/core';

@Component({
  selector: 'form-management-layout-renderer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,

  imports: [JsonFormsModule, InsureComponentsModule],
  template: `
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      @for (el of uischema?.elements; track el) {
        <jsonforms-outlet
          [schema]="schema"
          [uischema]="el"
          [path]="path"
        ></jsonforms-outlet>
      }
    </div>
  `,
})
export class VerticalLayoutRendererComponent extends JsonFormsBaseRenderer<VerticalLayout> {
  override uischema!: VerticalLayout;
}

export const verticalLayoutTester = rankWith(1, uiTypeIs('VerticalLayout'));
