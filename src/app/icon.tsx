import { ImageResponse } from "next/og";
import { AppIconOg } from "@/lib/og-app-icon";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<AppIconOg side={512} />, {
    ...size,
  });
}
