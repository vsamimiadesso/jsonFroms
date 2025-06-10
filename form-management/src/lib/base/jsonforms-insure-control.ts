// src/app/components/base/jsonforms-custom-control.ts
import { ChangeDetectorRef, inject, ViewRef } from '@angular/core';
import { Validators } from '@angular/forms';
import { JsonFormsControl } from '@jsonforms/angular';
import { JsonSchema7 } from '@jsonforms/core';

export class JsonFormsInsureControl extends JsonFormsControl {
  protected readonly cdr = inject(ChangeDetectorRef);

  get isRequired(): boolean {
    console.log('Checking if control is required');
    this.rootSchema = this.rootSchema as JsonSchema7;
    if (!this.uischema.scope || !this.rootSchema) return false;

    const data = this.data;
    const pathParts = this.uischema.scope.replace(/^#\//, '').split('/');
    const propertyKey = pathParts[pathParts.length - 1];

    const matchesIfCondition = (ifSchema: any, data: any): boolean => {
      if (!ifSchema?.properties) return false;
      return Object.entries(ifSchema.properties).every(([key, cond]) => {
        const value = data?.[key];
        if (typeof cond === 'object' && cond !== null) {
          if ('const' in cond && cond.const !== undefined)
            return value === (cond as any).const;
          if ('enum' in cond && (cond as any).enum !== undefined)
            return (cond as any).enum.includes(value);
        }
        return false;
      });
    };

    const checkRequiredInSchema = (schema: any): boolean => {
      return (
        Array.isArray(schema?.required) && schema.required.includes(propertyKey)
      );
    };

    if (checkRequiredInSchema(this.rootSchema)) return true;

    if (this.rootSchema.if && matchesIfCondition(this.rootSchema.if, data)) {
      return checkRequiredInSchema(this.rootSchema.then);
    }

    if (
      this.rootSchema.if &&
      !matchesIfCondition(this.rootSchema.if, data) &&
      this.rootSchema.else
    ) {
      return checkRequiredInSchema(this.rootSchema.else);
    }

    return false;
  }

  override mapAdditionalProps(): void {
    if (!(this.cdr as ViewRef).destroyed) {
      const wasRequired = this.form.hasValidator(Validators.required);
      console.log('wasRequired', wasRequired);
      if (this.isRequired && !wasRequired) {
        this.form.setValidators([Validators.required]);
        //this.form.updateValueAndValidity();
      }

      if (!this.isRequired && wasRequired) {
        this.form.removeValidators(Validators.required);
        //this.form.updateValueAndValidity();
      }

      this.cdr.markForCheck();
    }
  }

  public shallowEqual(obj1: any, obj2: any): boolean {
    if (obj1 === obj2) return true;
    if (
      typeof obj1 !== 'object' ||
      obj1 === null ||
      typeof obj2 !== 'object' ||
      obj2 === null
    )
      return false;

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
      if (obj1[key] !== obj2[key]) return false;
    }

    return true;
  }
}
