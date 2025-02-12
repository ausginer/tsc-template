## tsc-template

This project provides utilities to facilitate the creation and manipulation of TypeScript Abstract Syntax Trees (ASTs). The key utility is the `ast` function that works similarly to the [@babel/template](https://babeljs.io/docs/babel-template) package but for TypeScript. 

### Installation

To install the project, run:

```bash
npm install tsc-template
```

### Features

#### AST Generation
**Easily create TypeScript ASTs from template strings.**

The creation of TypeScript AST is not trivial and has nuances. To simplify that, you can use `ast` function that consumes a string and returns an AST for it.

```ts
import ast from 'tsc-template';
import { isSourceFile } from 'typescript';

const file = ast`const foo = [1, 2, 3]`;
assert(isSourceFile(file));
assertEqual(file.getText(), 'const foo = [1, 2, 3]');
```

#### Mix of String and AST Nodes
**Use TypeScript nodes directly in the code as if they are simple strings.**

When you work with massive TS generation, sometimes you need to use nodes created in one place, in another. With the plain TypeScript, you would need to create a TS transformer or create all the tree manually. However, with power of template literals, you can use the nodes directly in the code you provide to `ast` function.

```ts
import ast from 'tsc-template';
import { factory } from 'typescript';

const fooId = factory.createIdentifier('foo');
const file = ast`const ${fooId} = [1, 2, 3]`;

assertEqual(file.getText(), 'const foo = [1, 2, 3]');
```

#### Smart Result Injection
**Inject the result of one `ast` function to another; no complex selectors required.**

What if you have created a good chunk of the code using the `ast` function and want to inject it into another chunk? No problem: just use the result of one `ast` function as a part of another! The smart injection system will find the correct node, so you don't need to create complex selectors.

```ts
import ast from 'tsc-template';

const file = ast`const foo = ${ast`[1, 2, 3]`}`;

assertEqual(file.getText(), 'const foo = [1, 2, 3]');
```

#### Tags for Custom AST Extractions
**Use extractor tags to select only a part of the code you need.**

Sometimes, the code you can create via `ast` function is represented incorrectly in TypeScript AST. E.g., when you declare a function in the module root, it will be `FunctionDeclaration` while the function assigned to the variable is `FunctionExpression`. What to do? 

It's simple. Use extractor tags! `%{` and `}%` would allow you to select the correct part of the code you want to have as AST.

```ts
import ast from 'tsc-template';

const functionExpression = ast`const b = %{ function b() {} }%`;
const file = ast`const x = ${functionExpression}`;
assertEquals(file.getText(), 'const x = function b() {};');
```

### License

This project is licensed under the MIT License.