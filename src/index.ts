import {
  createSourceFile,
  forEachChild,
  isIdentifier,
  isSourceFile,
  type Node,
  ScriptKind,
  ScriptTarget,
  type SourceFile,
  transform,
  type TransformerFactory,
  type Visitor,
} from 'typescript';
import { createTransformer } from './createTransformer.js';
import { extractFillerPart } from './extractFillerPart.js';

export * from './createTransformer.js';

export default function ast(
  parts: TemplateStringsArray,
  ...fillers: ReadonlyArray<Node | null | undefined>
): SourceFile {
  let code = '';
  const transformers: Array<TransformerFactory<SourceFile>> = [];

  for (let i = 0; i < parts.length; i++) {
    const filler = fillers[i];
    code += parts[i];

    if (filler != null) {
      const id = `id${crypto.randomUUID().replace(/-/gu, '_')}`;
      code += id;

      let _filler: Node | undefined = filler;

      if (isSourceFile(filler)) {
        const fillerString = extractFillerPart(filler.getText());

        const visitor: Visitor<Node, Node | undefined> = (node) => {
          if (node.getText(filler) === fillerString) {
            _filler = node;
          }

          return forEachChild(node, visitor);
        };

        forEachChild(filler, visitor);
      }

      transformers.push(createTransformer((n) => (isIdentifier(n) && n.text === id ? _filler : n)));
    }
  }

  return transform(createSourceFile('', code, ScriptTarget.Latest, false, ScriptKind.TSX), transformers)
    .transformed[0]!;
}
