import { Project } from 'ts-morph';

export async function extractFunctionCode(
  filePath: string,
  functionName?: string
): Promise<string> {
  const project = new Project({});
  const sourceFile = project.addSourceFileAtPath(filePath);

  if (!functionName) {
    return sourceFile.getFullText();
  }

  // Try functions, exported functions, and const arrow functions
  const fnDecl = sourceFile
    .getFunctions()
    .find((f) => f.getName() === functionName);
  if (fnDecl) return fnDecl.getText();

  const exports = sourceFile.getExportedDeclarations().get(functionName);
  if (exports && exports[0]) return exports[0].getText();

  const varDecl = sourceFile.getVariableDeclaration(functionName);
  if (varDecl) return varDecl.getText();

  throw new Error(`Function "${functionName}" not found in ${filePath}`);
}
