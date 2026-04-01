import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import prisma from '@/lib/prisma';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || '',
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { messages, config, products, userId } = body;

        if (!config || !config.model) {
            return NextResponse.json({ error: 'Model configuration is required' }, { status: 400 });
        }

        const estimatedPromptTokens = JSON.stringify(messages).length / 4;

        // Check Rate Limiting optionally
        if (userId) {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { currentTokenUsage: true, maxTokenLimit: true, subscriptionPlan: true }
            });

            if (user) {
                const maxTokensAllowed = user.maxTokenLimit;
                if (user.currentTokenUsage + estimatedPromptTokens > maxTokensAllowed) {
                    return NextResponse.json(
                        { 
                            error: 'Rate limit exceeded', 
                            message: `You have reached your limit of ${maxTokensAllowed} tokens. Please upgrade your plan.`
                        }, 
                        { status: 429 }
                    );
                }
            }
        }

        const systemPrompt = config.prompt || 'You are a helpful AI assistant.';

        let finalSystemPrompt = systemPrompt;

        // Append product information if available
        let productContext = "Belum ada produk saat ini.";
        if (products && products.length > 0) {
            productContext = products.map((p: any) => {
                if (typeof p === 'string') return `- ${p}`;
                return `- ${p.name}: ${p.description || ''} (Price: ${p.price || 'N/A'})`;
            }).join('\n');
        }

        finalSystemPrompt += `\n\n=== 🔴 DATABASE PRODUK TOKO (LIVE) ===\nBerikut ini adalah katalog produk yang bisa Anda tawarkan kepada pelanggan:\n\n${productContext}`;

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
        
        // Update user token usage
        const totalTokensUsed = chatCompletion.usage?.total_tokens || 
            (estimatedPromptTokens + (reply.length / 4)); // fallback if usage not provided

        if (userId) {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    currentTokenUsage: { increment: Math.ceil(totalTokensUsed) },
                    aiMessageCount: { increment: 1 },
                    lastMessageAt: new Date()
                }
            });
        }

        return NextResponse.json({ reply, usage: { totalTokensUsed } });
    } catch (error: any) {
        console.error('Error in chat test:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
