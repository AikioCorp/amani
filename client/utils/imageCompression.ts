// Système de compression d'images pour Amani Finance
// Optimise les images sans perte de qualité visible

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 à 1.0
  format?: "webp" | "jpeg" | "png" | "auto";
  maxSizeKB?: number;
}

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  format: string;
  dimensions: { width: number; height: number };
}

// Configuration par défaut optimisée pour Amani Finance
const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.85, // 85% - équilibre parfait qualité/taille
  format: "webp", // Format moderne, meilleure compression
  maxSizeKB: 500, // 500KB max par image
};

/**
 * Compresse une image en maintenant la qualité visuelle
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {},
): Promise<CompressionResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      try {
        // Calculer les nouvelles dimensions en conservant le ratio
        const { width: newWidth, height: newHeight } = calculateDimensions(
          img.width,
          img.height,
          opts.maxWidth,
          opts.maxHeight,
        );

        canvas.width = newWidth;
        canvas.height = newHeight;

        if (!ctx) {
          throw new Error("Impossible de créer le contexte canvas");
        }

        // Optimisations de rendu pour une meilleure qualité
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Dessiner l'image redimensionnée
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        // Déterminer le format optimal
        const format =
          opts.format === "auto" ? detectOptimalFormat(file.type) : opts.format;

        const mimeType = getMimeType(format);

        // Compression adaptative pour atteindre la taille cible
        compressToTargetSize(
          canvas,
          mimeType,
          opts.quality,
          opts.maxSizeKB * 1024,
          file.size,
        )
          .then((compressedBlob) => {
            const compressedFile = new File(
              [compressedBlob],
              generateFileName(file.name, format),
              { type: mimeType },
            );

            const result: CompressionResult = {
              file: compressedFile,
              originalSize: file.size,
              compressedSize: compressedFile.size,
              compressionRatio: Math.round(
                ((file.size - compressedFile.size) / file.size) * 100,
              ),
              format: format,
              dimensions: { width: newWidth, height: newHeight },
            };

            resolve(result);
          })
          .catch(reject);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error("Impossible de charger l'image"));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Calcule les dimensions optimales en conservant le ratio
 */
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  let { width, height } = { width: originalWidth, height: originalHeight };

  // Réduction proportionnelle si nécessaire
  if (width > maxWidth) {
    height = Math.round((height * maxWidth) / width);
    width = maxWidth;
  }

  if (height > maxHeight) {
    width = Math.round((width * maxHeight) / height);
    height = maxHeight;
  }

  return { width, height };
}

/**
 * Détecte le format optimal basé sur le contenu
 */
function detectOptimalFormat(
  originalMimeType: string,
): "webp" | "jpeg" | "png" {
  // WebP pour la plupart des cas (meilleure compression)
  if (isWebPSupported()) {
    return "webp";
  }

  // PNG pour les images avec transparence
  if (originalMimeType === "image/png") {
    return "png";
  }

  // JPEG par défaut
  return "jpeg";
}

/**
 * Vérifie le support WebP du navigateur
 */
function isWebPSupported(): boolean {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0;
}

/**
 * Retourne le type MIME correspondant au format
 */
function getMimeType(format: string): string {
  const mimeTypes: Record<string, string> = {
    webp: "image/webp",
    jpeg: "image/jpeg",
    png: "image/png",
  };
  return mimeTypes[format] || "image/jpeg";
}

/**
 * Compression adaptative pour atteindre la taille cible
 */
async function compressToTargetSize(
  canvas: HTMLCanvasElement,
  mimeType: string,
  initialQuality: number,
  targetSize: number,
  originalSize: number,
): Promise<Blob> {
  let quality = initialQuality;
  let blob: Blob | null = null;

  // Compression itérative pour optimiser la taille
  for (let attempt = 0; attempt < 5; attempt++) {
    blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, mimeType, quality);
    });

    if (!blob) {
      throw new Error("Échec de la compression");
    }

    // Si la taille est acceptable ou si on a atteint la qualité minimale
    if (blob.size <= targetSize || quality <= 0.3) {
      break;
    }

    // Réduire la qualité pour la prochaine tentative
    quality -= 0.1;
  }

  if (!blob) {
    throw new Error("Impossible de compresser l'image");
  }

  return blob;
}

/**
 * Génère un nom de fichier optimisé
 */
function generateFileName(originalName: string, format: string): string {
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "");
  const timestamp = Date.now();

  // Nettoyer le nom de fichier
  const cleanName = nameWithoutExt
    .toLowerCase()
    .replace(/[^a-z0-9\-_]/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 50);

  const extensions: Record<string, string> = {
    webp: ".webp",
    jpeg: ".jpg",
    png: ".png",
  };

  return `${cleanName}-${timestamp}${extensions[format] || ".jpg"}`;
}

/**
 * Valide qu'un fichier est une image
 */
export function validateImageFile(file: File): boolean {
  const validTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  return validTypes.includes(file.type) && file.size > 0;
}

/**
 * Convertit les bytes en format lisible
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Crée une prévisualisation de l'image
 */
export function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Configurations prédéfinies pour différents usages
 */
export const COMPRESSION_PRESETS = {
  // Image d'avatar - petite taille, qualité élevée
  avatar: {
    maxWidth: 300,
    maxHeight: 300,
    quality: 0.9,
    format: "webp" as const,
    maxSizeKB: 50,
  },

  // Image d'article mise en avant
  featured: {
    maxWidth: 1200,
    maxHeight: 630,
    quality: 0.85,
    format: "webp" as const,
    maxSizeKB: 300,
  },

  // Image dans le contenu d'article
  content: {
    maxWidth: 800,
    maxHeight: 600,
    quality: 0.8,
    format: "webp" as const,
    maxSizeKB: 200,
  },

  // Thumbnail - très petite
  thumbnail: {
    maxWidth: 150,
    maxHeight: 150,
    quality: 0.7,
    format: "webp" as const,
    maxSizeKB: 20,
  },

  // Qualité maximale pour l'impression
  print: {
    maxWidth: 2400,
    maxHeight: 1600,
    quality: 0.95,
    format: "jpeg" as const,
    maxSizeKB: 2000,
  },
} as const;

/**
 * Compresse une image avec un preset prédéfini
 */
export async function compressWithPreset(
  file: File,
  preset: keyof typeof COMPRESSION_PRESETS,
): Promise<CompressionResult> {
  return compressImage(file, COMPRESSION_PRESETS[preset]);
}

/**
 * Traitement par lot d'images
 */
export async function compressMultipleImages(
  files: File[],
  options: CompressionOptions = {},
  onProgress?: (current: number, total: number, fileName: string) => void,
): Promise<CompressionResult[]> {
  const results: CompressionResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    if (!validateImageFile(file)) {
      console.warn(`Fichier ignoré (type non valide): ${file.name}`);
      continue;
    }

    onProgress?.(i + 1, files.length, file.name);

    try {
      const result = await compressImage(file, options);
      results.push(result);
    } catch (error) {
      console.error(`Erreur lors de la compression de ${file.name}:`, error);
    }
  }

  return results;
}
