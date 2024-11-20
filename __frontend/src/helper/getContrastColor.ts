import tinycolor from "tinycolor2";

export function getContrastColor(baseColor: any) {
  const value = tinycolor(baseColor);
  if (value.getLuminance() <= 0.5) {
    return "#fff";
  }
  return "#000";
}
