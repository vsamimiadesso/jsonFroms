import { and, formatIs, rankWith, schemaTypeIs } from '@jsonforms/core';

export const insureInputTester = rankWith(
  5, // must be > 1
  and(schemaTypeIs('string'), formatIs('input')),
);
