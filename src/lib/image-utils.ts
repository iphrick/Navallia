/**
 * Resizes an image File to the given max dimension and returns a base64 data URL.
 * Keeps aspect ratio. Output is always JPEG for smaller size.
 */
export function resizeImageToBase64(
  file: File,
  maxPx = 256,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const { naturalWidth: w, naturalHeight: h } = img;
      const scale = Math.min(1, maxPx / Math.max(w, h));
      const canvas = document.createElement("canvas");
      canvas.width  = Math.round(w * scale);
      canvas.height = Math.round(h * scale);

      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas não suportado"));

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Falha ao carregar imagem"));
    };

    img.src = objectUrl;
  });
}
