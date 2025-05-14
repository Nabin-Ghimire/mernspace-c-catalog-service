// utils/localUploader.ts
import path from "path";
import { promises as fs } from "fs";
import { UploadedFile } from "express-fileupload";

const uploadDir = path.join(__dirname, "../uploads");

export async function saveFileLocally(file: UploadedFile): Promise<string> {
    // Ensure the uploads directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // Create a unique filename
    const uniqueName = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadDir, uniqueName);

    // Move file to uploads directory
    await file.mv(filePath);

    return filePath; // Return the local path for further processing
}
