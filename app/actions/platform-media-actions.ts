'use server';

import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads');

// Helper to check if file is an image
const isImage = (filename: string) => {
    const ext = path.extname(filename).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext);
};

export async function getSystemUploads() {
    try {
        if (!fs.existsSync(UPLOAD_DIR)) {
            return { success: true, data: [] };
        }

        const files = fs.readdirSync(UPLOAD_DIR);

        const uploads = files
            .filter(file => isImage(file))
            .map(file => {
                const stats = fs.statSync(path.join(UPLOAD_DIR, file));
                return {
                    name: file,
                    url: `/uploads/${file}`,
                    size: stats.size,
                    createdAt: stats.birthtime,
                };
            })
            // Sort by newest first
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        return { success: true, data: uploads };
    } catch (error) {
        console.error("Error reading uploads:", error);
        return { success: false, error: "Failed to fetch uploads" };
    }
}

export async function deleteSystemUpload(filename: string) {
    try {
        const filepath = path.join(UPLOAD_DIR, filename);

        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
            return { success: true };
        }

        return { success: false, error: "File not found" };
    } catch (error) {
        console.error("Error deleting file:", error);
        return { success: false, error: "Failed to delete file" };
    }
}
