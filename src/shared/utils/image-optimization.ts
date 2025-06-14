export class ImageOptimizer {
    // WebP 지원 체크
    static supportsWebP(): boolean {
        if (typeof window === "undefined") return false;

        const canvas = document.createElement("canvas");
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0;
    }

    // AVIF 지원 체크
    static supportsAVIF(): boolean {
        if (typeof window === "undefined") return false;

        const canvas = document.createElement("canvas");
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL("image/avif").indexOf("data:image/avif") === 0;
    }

    // 최적화된 이미지 경로 반환
    static getOptimizedImagePath(originalPath: string): string {
        const basePath = originalPath.replace(".png", "");

        if (this.supportsAVIF()) {
            return `${basePath}.avif`;
        } else if (this.supportsWebP()) {
            return `${basePath}.webp`;
        }

        return originalPath; // 원본 PNG 반환
    }

    // 이미지 크기 최적화
    static getResponsiveImageSrc(basePath: string, width: number): string {
        const optimizedPath = this.getOptimizedImagePath(basePath);

        // 화면 크기에 따른 이미지 크기 조정
        if (width <= 150) return optimizedPath.replace(".", "_sm.");
        if (width <= 300) return optimizedPath.replace(".", "_md.");
        if (width <= 600) return optimizedPath.replace(".", "_lg.");

        return optimizedPath;
    }
}
