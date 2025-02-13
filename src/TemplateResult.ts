import type { Node, SourceFile } from 'typescript';

export const $templateResult = Symbol('TemplateResult');

export type TemplateResult = Readonly<{
  brand: typeof $templateResult;
  node: Node;
  source: SourceFile;
}>;

export function isTemplateResult(value: unknown): value is TemplateResult {
  return typeof value === 'object' && value !== null && 'brand' in value && value.brand === $templateResult;
}
