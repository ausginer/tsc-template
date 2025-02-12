import {
  type Node,
  type SourceFile,
  type TransformationContext,
  type TransformerFactory,
  visitEachChild,
  type Visitor,
  type VisitResult,
} from 'typescript';

export type Transformer = (node: Node) => VisitResult<Node | undefined>;

export function createTransformer(transformer: Transformer): TransformerFactory<SourceFile> {
  return (context: TransformationContext) => (root: SourceFile) => {
    const visitor: Visitor<Node, Node | undefined> = (node) => {
      const transformed = transformer(node);

      if (transformed !== node) {
        return transformed;
      }

      return visitEachChild(transformed, visitor, context);
    };
    return visitEachChild(root, visitor, context);
  };
}
