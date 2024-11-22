import { izipLongest } from 'itertools';
import { customAlphabet } from 'nanoid';
import ts, { type Node, type SourceFile, type Statement } from 'typescript';
import { transform, type Transformer } from './transform.js';

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 25);

export type ASTTaggedTemplate = <T extends Node>(
  parts: readonly string[],
  ...fillers: ReadonlyArray<Node | null | undefined>
) => T | undefined;

const $astResultBrand = Symbol('ASTResult');

export type ASTResult = Readonly<{
  brand: typeof $astResultBrand;
  statements: readonly Statement[];
}>;

export function isASTResult(value: unknown): value is ASTResult {
  return typeof value === 'object' && value != null && 'brand' in value && value.brand === $astResultBrand;
}

function select({ statements: [statement] }: ASTResult): Node | undefined {
  if (!statement) {
    return undefined;
  }

  if (ts.isExpressionStatement(statement)) {
    return statement.expression;
  }

  return statement;
}

export function ast(
  parts: readonly string[],
  ...fillers: ReadonlyArray<ASTResult | Node | null | undefined>
): ASTResult {
  let code = '';
  const transformers: Transformer[] = [];

  for (const [part, filler] of izipLongest(parts, fillers, null)) {
    code += part ?? '';

    if (filler != null) {
      const id = nanoid();
      code += id;

      let node: Node | undefined;

      if (isASTResult(filler)) {
        node = select(filler);
      } else {
        node = filler;
      }

      transformers.push((n) => (ts.isIdentifier(n) && n.text === id ? node : n));
    }
  }

  let sourceFile = ts.createSourceFile('f.ts', code, ts.ScriptTarget.Latest, false);

  sourceFile = ts.transform<SourceFile>(
    sourceFile,
    transformers.map((transformer) => transform<SourceFile>(transformer)),
  ).transformed[0]!;

  return {
    brand: $astResultBrand,
    statements: sourceFile.statements,
  };
}
