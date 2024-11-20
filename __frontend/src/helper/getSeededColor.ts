import seedrandom from "seedrandom";
import { getContrastColor } from "./getContrastColor";

// Rastgele bir hex rengi üretmek için fonksiyon
export function getSeededColor(seed: string) {
  const rng = seedrandom(seed); // String'den deterministik rastgelelik oluştur
  const r = Math.floor(rng() * 256);
  const g = Math.floor(rng() * 256);
  const b = Math.floor(rng() * 256);

  return {
    backgroundColor: `rgb(${r}, ${g}, ${b})`,
    color: getContrastColor({ r, g, b }),
  };
}
