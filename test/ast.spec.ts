/* eslint-disable @typescript-eslint/unbound-method */
import { createPrinter, EmitHint, factory, isIdentifier, NewLineKind, transform } from 'typescript';
import { describe, expect, it } from 'vitest';
import { createTransformer } from '../createTransformer.js';
import ast from '../src/index.js';

describe('ast', () => {
  const printer = createPrinter({
    newLine: NewLineKind.LineFeed,
  });

  it('should generate a Typescript AST', () => {
    const { node, source } = ast`const x = 1;`;
    expect(printer.printNode(EmitHint.Unspecified, node, source)).to.be.equal('const x = 1');
  });

  it('should use a filler', () => {
    const array = [1, 2, 3];
    const arrayNode = factory.createArrayLiteralExpression(array.map(factory.createNumericLiteral));
    const { node, source } = ast`const x = ${arrayNode};`;
    expect(printer.printNode(EmitHint.Unspecified, node, source)).to.be.equal('const x = [1, 2, 3]');
  });

  it('should use a string as a filler', () => {
    const { node, source } = ast`const x = ${'[1, 2, 3]'};`;
    expect(printer.printNode(EmitHint.Unspecified, node, source)).to.be.equal('const x = [1, 2, 3]');
  });

  it('should accept a result of another ast function as a filler', () => {
    const { node, source } = ast`const x = ${ast`[1, 2, 3]`};`;
    expect(printer.printNode(EmitHint.Unspecified, node, source)).to.be.equal('const x = [1, 2, 3]');
  });

  it('should extract a part of the AST bound with @START and @END tags to use as a filler', () => {
    const { node, source } = ast`const x = ${ast`const b = /** @START */ function tst() {} /** @END */`};`;
    expect(printer.printNode(EmitHint.Unspecified, node, source)).to.be.equal('const x = function tst() { }');
  });

  it('should extract a part of the AST bound with only @START tag', () => {
    const { node, source } = ast`const x = ${ast`const b = /** @START */ function tst() {}`};`;
    expect(printer.printNode(EmitHint.Unspecified, node, source)).to.be.equal('const x = function tst() { }');
  });

  it('should extract a part of the AST bound with only @END tag', () => {
    const { node, source } = ast`${ast`((a, b) => {}) /** @END */ ()`}(10, 20);`;
    expect(printer.printNode(EmitHint.Unspecified, node, source)).to.be.equal('((a, b) => { })(10, 20)');
  });

  it('should extract a part of the AST bound with "%{" and "}%" tags', () => {
    const { node, source } = ast`const x = ${ast`const b = %{ function tst() {} }%`};`;
    expect(printer.printNode(EmitHint.Unspecified, node, source)).to.be.equal('const x = function tst() { }');
  });

  it('should allow using the template result node as a part of another AST', () => {
    const { source } = ast`__FN__(10, 20)`;
    const { node } = ast`%{ ((a, b) => {}) }% ()`;

    const result = transform(source, [createTransformer((n) => (isIdentifier(n) && n.text === '__FN__' ? node : n))])
      .transformed[0]!;

    expect(printer.printFile(result)).to.be.equal('((a, b) => { })(10, 20);\n');
  });

  it('should allow multiline code extractors', () => {
    const result = ast`%{ ((a, b) => {
  return a + b;
}) }% ()`;
    const { source } = ast`${result}(10, 20);`;
    expect(printer.printFile(source)).to.be.equal(`((a, b) => {
    return a + b;
})(10, 20);\n`);
  });

  it('should fail if there is more than one set of code extractors', () => {
    const error = 'Only one set of code extractors is allowed: %{ ... }% or /** @START */ ... /** @END */';

    expect(() => ast`const x = ${ast`const b = %{ function tst() %{ {} }% }%`};`).to.throw(error);
    expect(
      () => ast`const x = ${ast`const b = /** @START */ function tst() { /** @START */ {} /** @END */ }`};`,
    ).to.throw(error);
  });
});
