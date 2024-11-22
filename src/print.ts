import ts from 'typescript';
import type { ASTResult } from './ast.js';

const defaultPrinter = ts.createPrinter({
  newLine: ts.NewLineKind.LineFeed,
});

export function print(result: ASTResult, printer = defaultPrinter): string {
  return printer.printFile(
    ts.factory.updateSourceFile(
      ts.createSourceFile('f.ts', '', ts.ScriptTarget.Latest, false, ts.ScriptKind.TS),
      result.statements,
    ),
  );
}
