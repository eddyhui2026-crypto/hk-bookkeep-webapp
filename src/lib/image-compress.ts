/** 瀏覽器內壓 JPEG，目標約 maxBytes（預設 500KB） */
export async function compressImageToJpeg(
  file: File,
  maxBytes = 500 * 1024
): Promise<Blob> {
  const img = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  let q = 0.88;
  let w = img.width;
  let h = img.height;
  const maxSide = 1800;
  if (w > maxSide || h > maxSide) {
    const r = Math.min(maxSide / w, maxSide / h);
    w = Math.floor(w * r);
    h = Math.floor(h * r);
  }
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 不支援");
  ctx.drawImage(img, 0, 0, w, h);

  for (;;) {
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", q)
    );
    if (!blob) throw new Error("壓縮失敗");
    if (blob.size <= maxBytes || q < 0.32) {
      if (blob.size > maxBytes * 1.25) {
        throw new Error("相片太複雜，請試裁剪或影細張啲。");
      }
      return blob;
    }
    q -= 0.07;
  }
}
