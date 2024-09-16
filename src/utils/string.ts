/**
 * Generates a random string to be used as a unique key for React items.
 * @param length - The length of the random string. Default is 16.
 * @returns A random string of the specified length.
 */
export const generateRandomKey = (length: number = 7): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);

    result += characters[randomIndex];
  }

  return result;
};

