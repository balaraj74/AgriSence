const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({
    vertexai: {
        project: process.env.GCLOUD_PROJECT,
        location: process.env.GCLOUD_LOCATION
    }
});

const dir = path.join(__dirname, '../apps/web/src/ai/flows');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));

const systemPrompt = `You are an expert TypeScript engineer. I am migrating away from Genkit to a direct Gemini wrapper.
Your task is to refactor the provided TypeScript file containing an AI flow.
Follow these exact rules:
1. Remove all Genkit imports: \`import { ai } from '@/ai/genkit';\` and \`import { vertexAI } from '@genkit-ai/google-genai';\`
2. Change \`import { z } from 'genkit';\` to \`import { z } from 'zod';\`
3. Import the new wrapper: \`import { callGemini, getPrimaryModel, getVisionModel } from '@/ai/model-config';\`
4. Remove \`ai.defineFlow\` and instead put the logic directly into the exported function.
   Example:
   Before:
   export async function myFlow(input) { return myFlowObj(input); }
   const myFlowObj = ai.defineFlow({ ... }, async (input) => { ... });
   After:
   export async function myFlow(input) { ... }
5. Replace \`ai.generate\` calls with \`callGemini\`:
   Before:
   const { output } = await ai.generate({
     model: vertexAI.model('gemini-2.5-flash'),
     system: systemPrompt,
     prompt: promptText,
     output: { schema: OutputSchema }
   });
   After:
   const output = await callGemini(promptText, {
     preferredModel: getPrimaryModel(), // Use getVisionModel() if the prompt contains images
     systemInstruction: systemPrompt,
     responseSchema: OutputSchema,
   });
6. Handle image arrays: Genkit's promptPayload format \`[{ media: { url: uri } }]\` is NOT supported. \`callGemini\` accepts \`prompt: any\` (which is string or Part[]). If the input includes images, map the data URIs to inlineData Parts:
   \`\`\`typescript
   const promptPayload = [
     ...input.imageUris.map(uri => {
       const match = uri.match(/^data:(.+);base64,(.+)$/);
       if (match) {
         return { inlineData: { mimeType: match[1], data: match[2] } };
       }
       return { inlineData: { mimeType: 'image/jpeg', data: uri } };
     }),
     promptText,
   ];
   \`\`\`
7. For \`ai.definePrompt\`, just resolve it to a standard JavaScript template string that you format manually inside the function.
8. RETURN ONLY THE RAW TYPESCRIPT CODE. No markdown formatting, no backticks, no explanations. Just the file contents.`;

async function main() {
    for (const file of files) {
        if (['weather-search.ts', 'schemes-search.ts', 'farming-advice-chatbot.ts', 'crop-disease-detection.ts'].includes(file)) continue;

        const fullPath = path.join(dir, file);
        console.log(`Processing ${file}...`);
        const content = fs.readFileSync(fullPath, 'utf8');

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [
                    { text: systemPrompt },
                    { text: "Here is the file to refactor:\n\n" + content }
                ],
                config: {
                    temperature: 0,
                }
            });

            let newContent = response.text;
            // Strip markdown formatting if the model still includes it
            if (newContent.startsWith('```')) {
                newContent = newContent.replace(/^```(typescript|ts)?\n/, '');
                newContent = newContent.replace(/\n```$/, '');
            }

            fs.writeFileSync(fullPath, newContent);
            console.log(`Successfully refactored ${file}`);
        } catch (error) {
            console.error(`Failed to process ${file}:`, error);
        }
    }
}

main();
