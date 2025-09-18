export interface ImageAsset {
    id: string;
    src: string;
    priority: "high" | "medium" | "low";
    preloaded: boolean;
    blob?: Blob;
}

export interface ImageGroup {
    [key: string]: ImageAsset[];
}

export type Actions = "main_loop" | "hi";
