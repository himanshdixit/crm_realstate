import { z } from "zod";

export function resourceSchema(fields) {
  return z.object(Object.fromEntries(fields.map((field) => {
    if (field.type === "reference-multi") {
      const schema = z.array(z.string().regex(/^[a-f\d]{24}$/i, `Select a valid ${field.label.toLowerCase()}`));
      return [field.name, field.required ? schema.min(1, `${field.label} is required`) : schema.optional()];
    }
    let schema = field.type === "number"
      ? z.coerce.number({ message: `${field.label} must be a number` })
      : field.type === "json"
        ? z.string().min(2).transform((value, context) => {
          try { return JSON.parse(value); }
          catch { context.addIssue({ code: "custom", message: "Enter valid JSON" }); return z.NEVER; }
        })
        : field.type === "reference"
          ? z.string().regex(/^$|^[a-f\d]{24}$/i, `Select a valid ${field.label.toLowerCase()}`)
          : z.string();
    if (field.required) schema = field.type === "number" || field.type === "json" ? schema : schema.min(1, `${field.label} is required`);
    else schema = schema.optional().or(z.literal(""));
    return [field.name, schema];
  })));
}
