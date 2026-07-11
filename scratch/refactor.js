const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../apps/web/src/ai/flows');

const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));

files.forEach(file => {
    if (file === 'weather-search.ts' || file === 'schemes-search.ts' || file === 'crop-disease-detection.ts' || file === 'farming-advice-chatbot.ts') {
        return;
    }
    const fullPath = path.join(dir, file);
    let content = fs.readFileSync(fullPath, 'utf8');

    // 1. Replace imports
    content = content.replace(/import\s*{\s*ai\s*}\s*from\s*['"]@\/ai\/genkit['"];?\n?/, '');
    content = content.replace(/import\s*{\s*z\s*}\s*from\s*['"]genkit['"];?\n?/, "import { z } from 'zod';\n");
    content = content.replace(/import\s*{\s*vertexAI\s*}\s*from\s*['"]@genkit-ai\/google-genai['"];?\n?/, "import { callGemini, getPrimaryModel, getVisionModel } from '@/ai/model-config';\n");

    // 2. Refactor ai.generate
    content = content.replace(
        /const\s+{\s*output\s*}\s*=\s*await\s*ai\.generate\(\s*{\s*[\s\S]*?model:\s*vertexAI\.model\('[^']+'\),\s*(?:system:\s*([^,]+),)?\s*prompt:\s*([^,]+),\s*output:\s*{\s*schema:\s*([^}\s]+)\s*}\s*}\s*\);/g,
        (match, system, prompt, schema) => {
            let options = `{\n        preferredModel: getPrimaryModel(),\n        responseSchema: ${schema},\n      }`;
            if (system) {
                options = `{\n        preferredModel: getPrimaryModel(),\n        systemInstruction: ${system.trim()},\n        responseSchema: ${schema},\n      }`;
            }
            return `const output = await callGemini(${prompt.trim()}, ${options});`;
        }
    );

    // 3. Handle promptPayload arrays (like in live-advisor-flow.ts)
    content = content.replace(
        /const\s+{\s*output\s*}\s*=\s*await\s*ai\.generate\(\s*{\s*prompt:\s*([^,]+),\s*model:\s*vertexAI\.model\('[^']+'\),\s*output:\s*{\s*schema:\s*([^}\s]+)\s*}\s*}\s*\);/g,
        (match, prompt, schema) => {
            let options = `{\n        preferredModel: getVisionModel(),\n        responseSchema: ${schema},\n      }`;
            return `
      // Map Genkit promptPayload media urls to Gemini inlineData
      const mappedPrompt = ${prompt.trim()}.map((p: any) => {
        if (p.media && p.media.url) {
          const match = p.media.url.match(/^data:(.+);base64,(.+)$/);
          if (match) {
            return { inlineData: { mimeType: match[1], data: match[2] } };
          }
          return { inlineData: { mimeType: 'image/jpeg', data: p.media.url } };
        }
        return p;
      });
      const output = await callGemini(mappedPrompt, ${options});`;
        }
    );

    // 4. Extract logic from ai.defineFlow
    // Usually it looks like:
    // const flowName = ai.defineFlow( { ... }, async (input) => { ... } );
    // And export async function funcName(input: InputType): Promise<OutputType> { return flowName(input); }
    // Let's replace ai.defineFlow with a simple function definition
    content = content.replace(
        /const\s+(\w+)\s*=\s*ai\.defineFlow\(\s*{\s*name:\s*['"]\w+['"],\s*inputSchema:\s*\w+,\s*outputSchema:\s*\w+,?\s*},\s*(async\s*\(\s*input\s*\)\s*=>\s*{[\s\S]*?})\s*\);/g,
        (match, flowName, fnBody) => {
            return `const ${flowName} = ${fnBody};`;
        }
    );

    fs.writeFileSync(fullPath, content);
    console.log(`Refactored ${file}`);
});
