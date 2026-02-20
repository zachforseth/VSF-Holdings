import { NextResponse } from 'next/server';
import { classifyDocument } from '@/utils/google-ai';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
    try {
        // Create a dummy 1x1 pixel PNG
        const base64Png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
        const buffer = Buffer.from(base64Png, 'base64');

        console.log("Testing Vertex AI connection with dummy image...");
        const result = await classifyDocument(buffer, 'image/png', 'test-image.png');

        return NextResponse.json({
            success: true,
            result
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: String(error)
        }, { status: 500 });
    }
}
