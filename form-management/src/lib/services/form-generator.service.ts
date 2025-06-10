import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { delay } from 'rxjs/operators';

import {
  FormComposition,
  FormsService,
} from '../generated/form-management-api';
import { JsonSchema } from './schema.model';
// mock composition response
const mockComposition: FormComposition = {
  id: 'mock-composition-id',
  forms: [
    {
      id: 'form-1',
      type: 'formular_risk_assessment',
      created: '2025-01-01',
      formElements: [
        {
          elementType: 'RiskassesmentNeed',
          booleanValue: false,
        },
        {
          elementType: 'ExclusionBenefit',
          exclusionBenefit: 'strin223g',
          freeText: 'Freitext',
        },
        {
          elementType: 'PremiumSurcharge',
          premiumSurcharge: 'string',
          freeText: 'Freitext',
        },
      ],
    },
    // {
    //   id: 'form-2',
    //   type: 'formular_risk_review',
    //   created: '2025-01-01',
    //   formElements: [
    //     {
    //       elementType: 'RiskassesmentNeed',
    //       booleanValue: true,
    //     },
    //     {
    //       elementType: 'PremiumSurcharge',
    //       premiumSurcharge: 'High',
    //       freeText: 'High risk area',
    //     },
    //   ],
    // },
  ],
};
@Injectable({
  providedIn: 'root',
})
export class DynamicFormService {
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private formsService: FormsService,
  ) {}

  loadAndBuildFormFromCompositionId(formCompositionId: string): Observable<
    {
      form: FormGroup;
      config: any[];
      meta: { id: string; type: string; title?: string };
    }[]
  > {
    // For now simulate loading composition (mock instead of HTTP)
    return of(mockComposition).pipe(
      delay(300), // simulate async delay
      switchMap((composition: FormComposition) => {
        const formsArray = Array.isArray(composition.forms)
          ? composition.forms
          : [];

        // For each form, load schema and build formGroup
        const formRequests = formsArray.map((form) => {
          // Schema URL - could be dynamic depending on form.type
          const schemaUrl = `assets/schema/risk_assessment.json`;
          return this.http.get<JsonSchema>(schemaUrl).pipe(
            map((schema) => {
              // Build model from form elements array
              const model = this.buildModelFromElements(
                Array.isArray(form.formElements) ? form.formElements : [],
              );

              // Create FormGroup from schema + model
              const formGroup = this.createFormGroup(schema, model);

              // Generate UI config to render controls
              const config = this.getFormControlsConfig(schema, model);

              return {
                form: formGroup,
                config,
                meta: {
                  id: form.id as string,
                  type: form.type as string,
                },
              };
            }),
          );
        });

        return forkJoin(formRequests);
      }),
    );
  }

  /**
   * Converts array of elements [{elementType, ...fields}] into nested object keyed by elementType:
   * {
   *   RiskassesmentNeed: { booleanValue: true },
   *   ExclusionBenefit: { exclusionBenefit: 'string', freeText: 'Freitext' },
   *   ...
   * }
   */
  private buildModelFromElements(elements: unknown[]): Record<string, unknown> {
    const model: Record<string, unknown> = {};

    elements.forEach((element: any) => {
      const { elementType, ...fields } = element;

      // Special case for boolean elementType, to directly assign boolean value
      if (Object.prototype.hasOwnProperty.call(fields, 'booleanValue')) {
        model[elementType] = fields.booleanValue;
      } else {
        if (!model[elementType]) {
          model[elementType] = {};
        }
        Object.assign(model[elementType] as object, fields);
      }
    });

    return model;
  }

  createFormGroup(schema: JsonSchema, model: any = {}): FormGroup {
    const formGroup = this.fb.group({});

    // Iterate groups in schema (e.g. riskassessment)
    Object.entries(schema).forEach(([groupKey, groupSchema]) => {
      if (groupSchema.type === 'object' && groupSchema.properties) {
        const nestedGroup = this.fb.group({});

        // Iterate fields of the group (e.g. RiskassesmentNeed, ExclusionBenefit)
        Object.entries(groupSchema.properties).forEach(
          ([fieldKey, fieldSchema]) => {
            const typedFieldSchema =
              fieldSchema as import('./schema.model').JsonSchemaProperty;
            const value = model[fieldKey] ?? ''; // model keys here are elementType keys

            const isRequired = groupSchema.required?.includes(fieldKey);

            const validators = isRequired ? [Validators.required] : [];

            if (
              typedFieldSchema.type === 'object' &&
              typedFieldSchema.properties
            ) {
              // Nested object (e.g. ExclusionBenefit has subfields)
              const subGroup = this.fb.group({});
              Object.entries(typedFieldSchema.properties).forEach(
                ([subKey, subSchema]) => {
                  const subValue = model[fieldKey]?.[subKey] ?? '';
                  const subValidators =
                    (typedFieldSchema.required?.includes(subKey) ?? false)
                      ? [Validators.required]
                      : [];
                  subGroup.addControl(
                    subKey,
                    this.fb.control(subValue, subValidators),
                  );
                },
              );
              nestedGroup.addControl(fieldKey, subGroup);
            } else {
              nestedGroup.addControl(
                fieldKey,
                this.fb.control(value, validators),
              );
            }
          },
        );

        formGroup.addControl(groupKey, nestedGroup);
      }
    });

    return formGroup;
  }

  getFormControlsConfig(schema: JsonSchema, model: any = {}): any[] {
    if (!schema) return [];

    const generateControls = (
      properties: { [key: string]: any },
      modelSegment: any,
      requiredFields: string[] = [],
    ): any[] => {
      return Object.entries(properties).map(([fieldKey, fieldSchema]) => {
        const fieldValue = modelSegment?.[fieldKey];
        const isRequired = requiredFields.includes(fieldKey);

        if (
          fieldSchema.type === 'array' &&
          fieldSchema.items?.type === 'object'
        ) {
          const itemValue = Array.isArray(fieldValue)
            ? fieldValue[0] || {}
            : {};
          const itemRequired = Array.isArray(fieldSchema.items.required)
            ? fieldSchema.items.required
            : [];
          return {
            key: fieldKey,
            type: 'array',
            label: fieldSchema.title || fieldKey,
            required: isRequired,
            controls: generateControls(
              fieldSchema.items?.properties || {},
              itemValue,
              itemRequired,
            ),
          };
        }

        if (fieldSchema.type === 'object' && fieldSchema.properties) {
          return {
            key: fieldKey,
            type: 'object',
            label: fieldSchema.title || fieldKey,
            required: isRequired,
            controls: generateControls(
              fieldSchema.properties,
              fieldValue,
              fieldSchema.required || [],
            ),
          };
        }

        const widget = fieldSchema.widget
          ? {
              type: fieldSchema.widget.type,
              readonly: fieldSchema.widget.readonly ?? false,
              output: fieldSchema.widget.output ?? false,
            }
          : undefined;

        return {
          key: fieldKey,
          type: fieldSchema.type,
          label: fieldSchema.title || fieldKey,
          required: isRequired,
          value: fieldValue ?? '',
          options: (fieldSchema.enum || []).map((opt: any) => ({
            label: opt,
            value: opt,
          })),
          widget,
        };
      });
    };

    return Object.entries(schema)
      .filter(
        ([_, groupSchema]) =>
          groupSchema.type === 'object' && groupSchema.properties,
      )
      .map(([groupKey, groupSchema]) => ({
        groupKey,
        groupTitle: groupSchema.title || groupKey,
        controls: generateControls(
          groupSchema.properties || {},
          model,
          groupSchema.required || [],
        ),
      }));
  }
}
