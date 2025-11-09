// Get the full URL for images
export const getImageUrl = (path) => {
  if (!path) return '';

  // If path is already a full URL, return it
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Otherwise, prepend the API base URL
  const API_BASE_URL = import.meta.env.VITE_API_URL || '';
  return `${API_BASE_URL}${path}`;
};
