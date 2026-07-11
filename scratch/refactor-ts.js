const { Project, SyntaxKind } = require('ts-morph');
const path = require('path');

const project = new Project();
project.addSourceFilesAtPaths(path.join(__dirname, '../apps/web/src/ai/flows/*.ts'));

const includeFiles = ['weather-search.ts', 'schemes-search.ts', 'farming-advice-chatbot.ts', 'crop-disease-detection.ts'];

for (const sourceFile of project.getSourceFiles()) {
  const fileName = sourceFile.getBaseName();
  if (!includeFiles.includes(fileName)) {
    continue;
  }
  
  console.log('Processing', fileName);

  // 1. Remove Genkit imports
  const imports = sourceFile.getImportDeclarations();
  imports.forEach(imp => {
    const moduleSpecifier = imp.getModuleSpecifierValue();
    if (moduleSpecifier === '@/ai/genkit' || moduleSpecifier === '@genkit-ai/google-genai') {
      imp.remove();
    } else if (moduleSpecifier === 'genkit') {
      imp.setModuleSpecifier('zod');
    }
  });
  
  // Add new model-config import
  if (!sourceFile.getImportDeclaration(imp => imp.getModuleSpecifierValue() === '@/ai/model-config')) {
    sourceFile.addImportDeclaration({
      moduleSpecifier: '@/ai/model-config',
      namedImports: ['callGemini', 'getPrimaryModel']
    });
  }

  // 2. Find ai.defineFlow
  const varDecls = sourceFile.getVariableDeclarations();
  for (const varDecl of varDecls) {
    const init = varDecl.getInitializer();
    if (init && init.getKind() === SyntaxKind.CallExpression) {
      const expr = init.getExpression();
      if (expr.getText() === 'ai.defineFlow') {
        const args = init.getArguments();
        if (args.length === 2 && args[1].getKind() === SyntaxKind.ArrowFunction) {
          const arrowFunc = args[1];
          const bodyText = arrowFunc.getBodyText();
          const params = arrowFunc.getParameters().map(p => p.getText()).join(', ');
          
          let newBodyText = bodyText;
          
          newBodyText = newBodyText.replace(/const\s*{\s*output\s*}\s*=\s*await\s*ai\.generate\(\s*{\s*model:\s*vertexAI\.model\('[^']+'\),\s*system:\s*([\s\S]+?),\s*prompt:\s*([\s\S]+?),\s*output:\s*{\s*schema:\s*([A-Za-z0-9_]+),?\s*}\s*}\s*\);/g, 
            'const output = await callGemini($2, {\n        preferredModel: getPrimaryModel(),\n        systemInstruction: $1,\n        responseSchema: $3,\n      });'
          );
          // If system was not there
          newBodyText = newBodyText.replace(/const\s*{\s*output\s*}\s*=\s*await\s*ai\.generate\(\s*{\s*model:\s*vertexAI\.model\('[^']+'\),\s*prompt:\s*([\s\S]+?),\s*output:\s*{\s*schema:\s*([A-Za-z0-9_]+),?\s*}\s*}\s*\);/g, 
            'const output = await callGemini($1, {\n        preferredModel: getPrimaryModel(),\n        responseSchema: $2,\n      });'
          );
          // If prompt and model are flipped
          newBodyText = newBodyText.replace(/const\s*{\s*output\s*}\s*=\s*await\s*ai\.generate\(\s*{\s*prompt:\s*([\s\S]+?),\s*model:\s*vertexAI\.model\('[^']+'\),\s*output:\s*{\s*schema:\s*([A-Za-z0-9_]+),?\s*}\s*}\s*\);/g, 
            'const output = await callGemini($1, {\n        preferredModel: getPrimaryModel(),\n        responseSchema: $2,\n      });'
          );

          varDecl.setInitializer(`async (${params}) => {\n${newBodyText}\n}`);
        }
      }
    }
  }

  sourceFile.saveSync();
}
