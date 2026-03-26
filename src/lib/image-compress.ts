export type ImageCompressUiVariant = "hk" | "tw" | "sg" | "sgZh";

const COMPRESS_MSG: Record<
  ImageCompressUiVariant,
  { canvas: string; fail: string; complex: string }
> = {
  hk: {
    canvas: "Canvas 不支援",
    fail: "壓縮失敗",
    complex: "相片太複雜，請試裁剪或影細張啲。",
  },
  tw: {
    canvas: "不支援 Canvas",
    fail: "壓縮失敗",
    complex: "照片太複雜，請試著裁切或拍小一點。",
  },
  sg: {
    canvas: "Canvas is not supported",
    fail: "Compression failed",
    complex: "Image is too complex; try cropping or a smaller photo.",
  },
  sgZh: {
    canvas: "不支持 Canvas",
    fail: "压缩失败",
    complex: "图片过于复杂，请尝试裁剪或拍摄较小的照片。",
  },
};

/** 瀏覽器內壓 JPEG，目標約 maxBytes（預設 500KB） */
export async function compressImageToJpeg(
  file: File,
  maxBytes = 500 * 1024,
  ui: ImageCompressUiVariant = "hk"
): Promise<Blob> {
  const M = COMPRESS_MSG[ui];
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
  if (!ctx) throw new Error(M.canvas);
  ctx.drawImage(img, 0, 0, w, h);

  for (;;) {
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", q)
    );
    if (!blob) throw new Error(M.fail);
    if (blob.size <= maxBytes || q < 0.32) {
      if (blob.size > maxBytes * 1.25) {
        throw new Error(M.complex);
      }
      return blob;
    }
    q -= 0.07;
  }
}
