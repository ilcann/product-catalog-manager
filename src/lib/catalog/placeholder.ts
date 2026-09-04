import placeholder from "@/assets/placeholder.jpg";

/** Görsel bulunmadığında kullanılan varsayılan yer tutucu. */
export const PLACEHOLDER_IMAGE = placeholder;

/** Boş/eksik görsel URL'lerini yer tutucuyla değiştirir. */
export const imageOr = (url?: string | null): string =>
  url && url.trim() ? url : PLACEHOLDER_IMAGE;
