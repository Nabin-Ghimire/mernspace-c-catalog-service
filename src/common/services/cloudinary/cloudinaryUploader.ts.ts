// utils/cloudinaryUploader.ts
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import config from "config";
import path from "path";
import { unlink } from "fs/promises";

export class CloudinaryStorage {
    constructor() {
        cloudinary.config({
            cloud_name: config.get("cloudinary.cloudName"),
            api_key: config.get("cloudinary.apiKey"),
            api_secret: config.get("cloudinary.apiSecret"),
        });
    }

    async uploadToCloudinaryAndDeleteLocal(
        filePath: string,
    ): Promise<UploadApiResponse> {
        const fileName = path.basename(filePath); // use local filename as public_id

        try {
            const result = await cloudinary.uploader.upload(filePath, {
                use_filename: true,
                unique_filename: false,
                overwrite: true,
                public_id: fileName,
            });

            await unlink(filePath); // Delete local file after successful upload

            return result;
        } catch (error) {
            throw new Error(
                `Cloudinary upload failed: ${(error as Error).message}`,
            );
        }
    }

    async deleteFromCloudinary(publicId: string): Promise<void> {
        try {
            await cloudinary.uploader.destroy(publicId);
        } catch (error) {
            throw new Error(
                `Cloudinary delete failed: ${(error as Error).message}`,
            );
        }
    }
}
