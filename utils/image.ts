
export type MimeType = 'image/jpeg' | 'image/png' | 'image/webp';

export const fileToBase64 = (file: File): Promise<{ base64String: string; mimeType: MimeType }> => {
  return new Promise((resolve, reject) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        return reject(new Error('Unsupported file type. Please use JPG, PNG, or WEBP.'));
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve({ 
        base64String: reader.result as string,
        mimeType: file.type as MimeType
    });
    reader.onerror = error => reject(error);
  });
};

export const stripBase64Prefix = (base64String: string): string => {
    return base64String.split(',')[1];
};
