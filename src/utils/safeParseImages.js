/**
 * Safely parse images field that can contain either a URL string or JSON array
 * @param {string|null|undefined} imagesField - The images_c field value
 * @returns {Array} - Always returns an array of image URLs
 */
export function safeParseImages(imagesField) {
  // Handle null, undefined, or empty string
  if (!imagesField || imagesField.trim() === '') {
    return [];
  }

  // Try to parse as JSON first
  try {
    const parsed = JSON.parse(imagesField);
    // If it's already an array, return it
    if (Array.isArray(parsed)) {
      return parsed;
    }
    // If it's a single value, wrap in array
    return [parsed];
  } catch (error) {
    // If JSON parsing fails, treat as a URL string
    const trimmed = imagesField.trim();
    
    // Check if it looks like a URL or image path
    if (trimmed.startsWith('http') || trimmed.includes('.')) {
      return [trimmed];
    }
    
    // If it doesn't look like a URL, return empty array
    return [];
  }
}