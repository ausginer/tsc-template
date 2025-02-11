import ts, {
  type Node,
  type SourceFile,
  type TransformationContext,
  type TransformerFactory,
  type Visitor,
  type VisitResult,
} from 'typescript';

export type Transformer = (node: Node) => VisitResult<Node | undefined>;

export function transform(transformer: Transformer): TransformerFactory<SourceFile> {
  return (context: TransformationContext) => (root: SourceFile) => {
    const visitor: Visitor<Node, Node | undefined> = (node) => {
      const transformed = transformer(node);

      if (transformed !== node) {
        return transformed;
      }

      return ts.visitEachChild(transformed, visitor, context);
    };
    return ts.visitEachChild(root, visitor, context);
  };
}
