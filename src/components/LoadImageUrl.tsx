export const loadImage = async (name: string) => {
  try {
    const normalizedName = name.trim().toLowerCase();
    const imageModule = await import(`../assets/${normalizedName}.png`);
    return imageModule.default;
  } catch (error) {
    console.log("Image not found:", name);
    return undefined;
  }
};
