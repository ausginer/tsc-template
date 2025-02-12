/* eslint-disable @typescript-eslint/unbound-method */
import { createPrinter, factory, NewLineKind } from 'typescript';
import { describe, expect, it } from 'vitest';
import ast from '../src/index.js';

describe('ast', () => {
  const printer = createPrinter({
    newLine: NewLineKind.LineFeed,
  });

  it('should generate a Typescript AST', () => {
    const sourceFile = ast`const x = 1;`;
    expect(printer.printFile(sourceFile)).to.be.equal('const x = 1;\n');
  });

  it('should generate a Typescript AST with a filler', () => {
    const array = [1, 2, 3];
    const arrayNode = factory.createArrayLiteralExpression(array.map(factory.createNumericLiteral));
    const sourceFile = ast`const x = ${arrayNode};`;
    expect(printer.printFile(sourceFile)).to.be.equal('const x = [1, 2, 3];\n');
  });

  it('should accept a result of another ast function as a filler', () => {
    const sourceFile = ast`const x = ${ast`[1, 2, 3]`};`;
    expect(printer.printFile(sourceFile)).to.be.equal('const x = [1, 2, 3];\n');
  });

  it('should extract a part of the AST bound with @START and @END tags to use as a filler', () => {
    const sourceFile = ast`const x = ${ast`const b = /** @START */ function tst() {} /** @END */`};`;
    expect(printer.printFile(sourceFile)).to.be.equal('const x = function tst() { };\n');
  });

  it('should extract a part of the AST bound with only @START tag', () => {
    const sourceFile = ast`const x = ${ast`const b = /** @START */ function tst() {}`};`;
    expect(printer.printFile(sourceFile)).to.be.equal('const x = function tst() { };\n');
  });

  it('should extract a part of the AST bound with only @END tag', () => {
    const sourceFile = ast`const x = ${ast`[1, 2, 3]; /** @END */ console.log(10);`};`;
    expect(printer.printFile(sourceFile)).to.be.equal('const x = [1, 2, 3];\n');
  });
});
