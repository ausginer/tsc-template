/* eslint-disable @typescript-eslint/unbound-method */
import ts, { type ArrayLiteralExpression, type ExpressionStatement } from 'typescript';
import { describe, expect, it } from 'vitest';
import ast from '../src/index.js';

describe('ast', () => {
  const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed,
  });

  it('should generate a Typescript AST', () => {
    const sourceFile = ast`const x = 1;`;
    expect(printer.printFile(sourceFile)).to.be.equal('const x = 1;\n');
  });

  it('should generate a Typescript AST with a filler', () => {
    const array = [1, 2, 3];
    const arrayNode = ts.factory.createArrayLiteralExpression(array.map(ts.factory.createNumericLiteral));
    const sourceFile = ast`const x = ${arrayNode};`;
    expect(printer.printFile(sourceFile)).to.be.equal('const x = [1, 2, 3];\n');
  });

  it('should accept a result of another ast function as a filler', () => {
    const arrayAst = (ast`[1, 2, 3]`.statements[0] as ExpressionStatement).expression as ArrayLiteralExpression;
    const sourceFile = ast`const x = ${arrayAst};`;
    expect(printer.printFile(sourceFile)).to.be.equal('const x = [1, 2, 3];\n');
  });
});
