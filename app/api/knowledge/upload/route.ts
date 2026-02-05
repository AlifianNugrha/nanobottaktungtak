import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;

        // Ensure directory exists
        const uploadDir = path.join(process.cwd(), 'public', 'knowledge');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, filename);

        // Save PDF/Dominant File
        fs.writeFileSync(filePath, buffer);

        let textContent = '';

        // Extract Text based on file type
        if (file.type === 'application/pdf') {
            try {
                // @ts-ignore
                const pdf = require('pdf-parse');
                const data = await pdf(buffer);
                textContent = data.text;
            } catch (e) {
                console.error('PDF Parse Error:', e);
                textContent = 'Error parsing PDF content.';
            }
        } else if (file.type === 'text/plain') {
            textContent = buffer.toString('utf-8');
        } else {
            // Fallback for other files (just minimal info)
            textContent = `File: ${file.name} (Type: ${file.type})`;
        }

        // Clean up text (remove excessive newlines)
        textContent = textContent.replace(/\n\s*\n/g, '\n').trim();

        // Save extracted text to a .txt file for easier RAG retrieval later
        const txtFilename = `${filename}.txt`;
        const txtPath = path.join(uploadDir, txtFilename);
        fs.writeFileSync(txtPath, textContent);

        return NextResponse.json({
            success: true,
            file: {
                name: file.name,
                path: `/knowledge/${txtFilename}`, // Storing path to the TEXT file
                originalPath: `/knowledge/${filename}`,
                type: file.type,
                size: file.size
            }
        });

    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
    }
}
