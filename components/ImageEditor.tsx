
import React, { useState } from 'react';
import type { LoadingState } from '../types';

const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const RefreshIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-11.664 0l4.992-4.993m-4.993 0l-3.181 3.183a8.25 8.25 0 000 11.664l3.181 3.183" />
  </svg>
);


interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  loading: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ onSubmit, loading }) => {
  const [prompt, setPrompt] = useState('');
  const presetPrompts = ["Change background to blue", "Make me smile slightly", "Change to a professional business attire"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt);
      setPrompt('');
    }
  };

  const handlePresetClick = (preset: string) => {
    onSubmit(preset);
  };

  return (
    <div className="w-full mt-6">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., 'Change background to sky blue'"
          className="flex-grow px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary focus:border-primary"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="px-6 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Apply
        </button>
      </form>
      <div className="mt-3 flex flex-wrap gap-2">
        {presetPrompts.map(p => (
          <button 
            key={p} 
            onClick={() => handlePresetClick(p)}
            disabled={loading}
            className="px-3 py-1 text-sm bg-primary-light text-primary-dark dark:bg-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
};


interface ImageEditorProps {
  originalImage: string;
  editedImage: string | null;
  loadingState: LoadingState;
  error: string | null;
  onPromptSubmit: (prompt: string) => void;
  onStartOver: () => void;
}

const ImagePanel: React.FC<{ title: string; imageUrl: string | null; loadingState?: LoadingState; children?: React.ReactNode }> = ({ title, imageUrl, loadingState }) => {
    return (
        <div className="w-full">
            <h3 className="text-lg font-semibold text-center mb-2">{title}</h3>
            <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-700 rounded-lg shadow-inner overflow-hidden relative flex items-center justify-center">
            {imageUrl ? (
                <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
            ) : (
                <div className="text-gray-500">Preview</div>
            )}
            {loadingState && loadingState.active && (
                <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center text-white p-4">
                    <div className="w-8 h-8 border-4 border-t-transparent border-white rounded-full animate-spin mb-3"></div>
                    <p className="text-center">{loadingState.message}</p>
                </div>
            )}
            </div>
        </div>
    );
};

const ImageEditor: React.FC<ImageEditorProps> = ({
  originalImage,
  editedImage,
  loadingState,
  onPromptSubmit,
  onStartOver,
}) => {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ImagePanel title="Original" imageUrl={originalImage} />
        <ImagePanel title="AI Generated" imageUrl={editedImage} loadingState={loadingState} />
      </div>

      <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-center">Customize Your Photo</h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">Use text prompts to change the background, expression, and more.</p>
        <PromptInput onSubmit={onPromptSubmit} loading={loadingState.active} />
      </div>

      <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
        <a
          href={editedImage || '#'}
          download={`id-photo-${Date.now()}.png`}
          className={`w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors ${!editedImage || loadingState.active ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={(e) => (!editedImage || loadingState.active) && e.preventDefault()}
        >
          <DownloadIcon className="w-6 h-6 mr-3" />
          Download Photo
        </a>
        <button
          onClick={onStartOver}
          className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
        >
          <RefreshIcon className="w-6 h-6 mr-3" />
          Start Over
        </button>
      </div>
    </div>
  );
};

export default ImageEditor;
