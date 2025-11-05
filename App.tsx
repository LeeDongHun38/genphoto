
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ImageInput from './components/ImageInput';
import ImageEditor from './components/ImageEditor';
import { editImageWithPrompt } from './services/geminiService';
import { fileToBase64, MimeType } from './utils/image';
import type { LoadingState } from './types';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [originalImage, setOriginalImage] = useState<{ data: string; type: MimeType } | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<LoadingState>({ active: false, message: '' });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleImageSelected = async (file: File) => {
    setError(null);
    setEditedImage(null);
    try {
      const { base64String, mimeType } = await fileToBase64(file);
      setOriginalImage({ data: base64String, type: mimeType });
    } catch (err) {
      setError('Failed to read the image file. Please try again.');
    }
  };

  const generateInitialIdPhoto = useCallback(async () => {
    if (!originalImage) return;

    setLoading({ active: true, message: 'AI is creating your ID photo...' });
    setError(null);
    try {
      const initialPrompt = `Convert this into a professional ID photo suitable for a resume. The background should be a solid, neutral light gray. Ensure the person is centered. Perform subtle enhancements like removing minor skin blemishes and improving lighting for a natural, clean look. Do not change the person's facial features, expression or hair. Maintain a 3:4 aspect ratio.`;
      const result = await editImageWithPrompt(originalImage.data, originalImage.type, initialPrompt);
      setEditedImage(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during image generation.');
    } finally {
      setLoading({ active: false, message: '' });
    }
  }, [originalImage]);


  useEffect(() => {
    if (originalImage) {
        generateInitialIdPhoto();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalImage]);


  const handlePromptSubmit = async (prompt: string) => {
    if (!originalImage) {
      setError('Please upload an image first.');
      return;
    }
    setLoading({ active: true, message: 'Applying your changes...' });
    setError(null);
    try {
        const fullPrompt = `Using the original photo, generate a professional ID photo. Apply the following modification: "${prompt}". Maintain a 3:4 aspect ratio.`;
        const result = await editImageWithPrompt(originalImage.data, originalImage.type, fullPrompt);
        setEditedImage(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred while editing the image.');
    } finally {
      setLoading({ active: false, message: '' });
    }
  };

  const handleStartOver = () => {
    setOriginalImage(null);
    setEditedImage(null);
    setError(null);
    setLoading({ active: false, message: '' });
  };

  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <Header darkMode={darkMode} onToggleDarkMode={() => setDarkMode(!darkMode)} />
      <main className="container mx-auto p-4 md:p-8">
        {!originalImage ? (
          <ImageInput onImageSelected={handleImageSelected} />
        ) : (
          <ImageEditor
            originalImage={originalImage.data}
            editedImage={editedImage}
            loadingState={loading}
            error={error}
            onPromptSubmit={handlePromptSubmit}
            onStartOver={handleStartOver}
          />
        )}
         {error && !loading.active && (
          <div className="mt-4 text-center bg-red-100 dark:bg-red-900/50 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
