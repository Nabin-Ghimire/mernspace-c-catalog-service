export interface FileData {
    path: string;
}

export interface FileStorage {
    upload(data: FileData): Promise<void>;
    delete(filename: string): void;
    getObjectUri(filename: string): string;
}
