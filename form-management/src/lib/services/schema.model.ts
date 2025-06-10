export interface JsonSchemaProperty {
  type: string;
  title?: string;
  enum?: string[];
  properties?: {
    [key: string]: JsonSchemaProperty;
  };
  required?: string[];
  items?: JsonSchemaProperty;
  widget?: {
    type?: string;
    readonly?: boolean;
    output?: boolean;
  };
}

export interface JsonSchema {
  type: string; // "object"
  title?: string;
  required?: string[];
  properties?: {
    [key: string]: JsonSchemaProperty;
  };
}
