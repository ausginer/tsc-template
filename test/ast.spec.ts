/* eslint-disable @typescript-eslint/unbound-method */
import { describe, it } from 'node:test';
import { expect, use } from 'chai';
import chaiLike from 'chai-like';
import ts from 'typescript';
import { ast, print } from '../src/index.js';

use(chaiLike);

await describe('ast', async () => {
  await it('should generate a Typescript AST', () => {
    const statement = ast`const x = 1;`;
    expect(print(statement)).to.be.equal('const x = 1;\n');
  });

  await it('should generate a Typescript AST with a filler', () => {
    const array = [1, 2, 3];
    const arrayNode = ts.factory.createArrayLiteralExpression(array.map(ts.factory.createNumericLiteral));
    const statement = ast`const x = ${arrayNode};`;
    expect(print(statement)).to.be.equal('const x = [1, 2, 3];\n');
  });

  await it('should accept a result of another ast function as a filler', () => {
    const statement = ast`const x = ${ast`[1, 2, 3]`};`;
    expect(print(statement)).to.be.equal('const x = [1, 2, 3];\n');
  });
});
