import tinycolor from "tinycolor2";

type Color = string | { r: number; g: number; b: number };
export function getContrastColor(baseColor: Color) {
  const value = tinycolor(baseColor);
  if (value.getLuminance() <= 0.5) {
    return "#fff";
  }
  return "#000";
}
