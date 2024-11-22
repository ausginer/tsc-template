import ts, { type Node, type TransformationContext, type TransformerFactory, type VisitResult } from 'typescript';

export type Transformer = (node: Node) => VisitResult<Node | undefined>;

export function transform<T extends Node>(transformer: Transformer): TransformerFactory<T> {
  return (context: TransformationContext) => (root: T) => {
    const visitor = (node: Node): VisitResult<Node | undefined> => {
      const transformed = transformer(node);

      if (transformed !== node) {
        return transformed;
      }

      return ts.visitEachChild(transformed, visitor, context);
    };
    return ts.visitEachChild(root, visitor, context);
  };
}
