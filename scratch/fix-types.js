const { Project, SyntaxKind } = require('ts-morph');
const path = require('path');

const project = new Project();
project.addSourceFilesAtPaths(path.join(__dirname, '../apps/web/src/ai/flows/*.ts'));

for (const sourceFile of project.getSourceFiles()) {
  const funcs = sourceFile.getFunctions();
  const vars = sourceFile.getVariableDeclarations();
  
  if (funcs.length === 1 && funcs[0].isExported() && funcs[0].isAsync()) {
    const mainFunc = funcs[0];
    const returnType = mainFunc.getReturnTypeNode() ? mainFunc.getReturnTypeNode().getText() : null;
    const params = mainFunc.getParameters();
    
    if (params.length === 1) {
      const paramText = params[0].getText();
      const paramName = params[0].getName();
      
      const body = mainFunc.getBody();
      if (body) {
        const statements = body.getStatements();
        if (statements.length === 1 && statements[0].getKind() === SyntaxKind.ReturnStatement) {
          const retStmt = statements[0];
          const retExpr = retStmt.getExpression();
          if (retExpr && retExpr.getKind() === SyntaxKind.CallExpression) {
            const calledFunc = retExpr.getExpression().getText();
            
            // Find the var declaration for calledFunc
            const targetVar = vars.find(v => v.getName() === calledFunc);
            if (targetVar) {
              const init = targetVar.getInitializer();
              if (init && (init.getKind() === SyntaxKind.ArrowFunction || init.getKind() === SyntaxKind.FunctionExpression)) {
                const funcName = mainFunc.getName();
                mainFunc.remove();
                
                // Convert the target var into the exported function
                const stmt = targetVar.getVariableStatement();
                stmt.setDeclarationKind('const'); // doesn't matter since we replace it
                
                const initText = init.getBodyText();
                
                // Replace the whole statement with an exported async function
                stmt.replaceWithText(`export async function ${funcName}(${paramText})${returnType ? `: ${returnType}` : ''} {\n${initText}\n}`);
              }
            }
          }
        }
      }
    }
  }

  // Also fix implicit any for other arrow functions that might exist, like array maps, if it's easy, or leave to manual.
  sourceFile.saveSync();
}
