import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || '',
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { messages, config, products } = body;

        if (!config || !config.model) {
            return NextResponse.json({ error: 'Model configuration is required' }, { status: 400 });
        }

        const systemPrompt = config.prompt || 'You are a helpful AI assistant.';

        let finalSystemPrompt = systemPrompt;

        // Append product information if available
        if (products && products.length > 0) {
            const productContext = products.map((p: any) => {
                if (typeof p === 'string') return `- ${p}`;
                return `- ${p.name}: ${p.description || ''} (Price: ${p.price || 'N/A'})`;
            }).join('\n');

            finalSystemPrompt += `\n\nHere is the list of products you can recommend:\n${productContext}\n\nWhen recommending a product, please include its image URL if available in the format [IMAGE: <url>].`;
        }

        // CUSTOM KNOWLEDGE BASE
        if (config.knowledge && config.knowledge.length > 0) {
            let knowledgeText = '\n\n=== 📚 KNOWLEDGE BASE ===\nUse this info to answer questions:\n';
            const fs = require('fs');
            const path = require('path');

            for (const file of config.knowledge) {
                try {
                    const filePath = path.join(process.cwd(), 'public', file.path);
                    if (fs.existsSync(filePath)) {
                        const content = fs.readFileSync(filePath, 'utf-8');
                        knowledgeText += `\n--- [${file.name}] ---\n${content}\n`;
                    }
                } catch (e) {
                    console.error('Error reading knowledge file:', file.path);
                }
            }
            finalSystemPrompt += knowledgeText;
        }

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: finalSystemPrompt },
                ...messages
            ],
            model: config.model,
            temperature: 0.7,
            max_tokens: 1024,
        });

        const reply = chatCompletion.choices[0]?.message?.content || "";

        return NextResponse.json({ reply });
    } catch (error: any) {
        console.error('Error in chat test:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
