export function extractFillerPart(str: string): string {
  // Extract the filler part that starts from the `/** @START */` tag
  const [, startResult = str] = /\/\*\*\s*@START\s*\*\/(.*)/iu.exec(str) ?? [];
  // Extract the filler part that ends at the `/** @END */` tag
  const [, endResult = startResult] = /(.*?)\/\*\*\s*@END\s*\*\//iu.exec(startResult) ?? [];

  // Remove the leading and trailing whitespaces and the trailing semicolon/comma
  return endResult.trim().replace(/[;,]$/u, '');
}
