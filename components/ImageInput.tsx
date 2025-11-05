
import React, { useState, useRef, useCallback, useEffect } from 'react';

const UploadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM21 21H3" />
    </svg>
);

const CameraIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.776 48.776 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
    </svg>
);


// Custom Hook for Webcam Logic
const useWebcam = (onCapture: (file: File) => void) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isWebcamActive, setIsWebcamActive] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);

    const startWebcam = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setIsWebcamActive(true);
        } catch (error) {
            console.error("Error accessing webcam:", error);
            alert("Could not access your webcam. Please check your browser permissions.");
        }
    };

    const stopWebcam = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setIsWebcamActive(false);
    }, [stream]);

    const capturePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas) {
            const context = canvas.getContext('2d');
            if (context) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                canvas.toBlob((blob) => {
                    if (blob) {
                        const file = new File([blob], `webcam-photo-${Date.now()}.png`, { type: 'image/png' });
                        onCapture(file);
                        stopWebcam();
                    }
                }, 'image/png');
            }
        }
    };
    
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    return { videoRef, canvasRef, isWebcamActive, startWebcam, stopWebcam, capturePhoto };
};


interface ImageInputProps {
    onImageSelected: (file: File) => void;
}

const WebcamModal: React.FC<{
    videoRef: React.RefObject<HTMLVideoElement>;
    onCapture: () => void;
    onClose: () => void;
}> = ({ videoRef, onCapture, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl text-center relative max-w-2xl w-full">
            <h3 className="text-lg font-medium mb-4">Webcam Capture</h3>
            <video ref={videoRef} autoPlay playsInline className="w-full h-auto rounded-md mb-4" />
            <div className="flex justify-center space-x-4">
                <button onClick={onCapture} className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors">
                    Take Photo
                </button>
                <button onClick={onClose} className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors">
                    Cancel
                </button>
            </div>
            <button onClick={onClose} className="absolute top-2 right-2 p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
                &times;
            </button>
        </div>
    </div>
);


const ImageInput: React.FC<ImageInputProps> = ({ onImageSelected }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { videoRef, canvasRef, isWebcamActive, startWebcam, stopWebcam, capturePhoto } = useWebcam(onImageSelected);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            onImageSelected(event.target.files[0]);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-2">Create Your Perfect ID Photo</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">Upload a photo or use your webcam to get started.</p>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div 
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 flex flex-col items-center justify-center cursor-pointer hover:border-primary dark:hover:border-primary-light transition-colors"
                    onClick={handleUploadClick}
                >
                    <UploadIcon className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" />
                    <span className="text-xl font-semibold text-gray-700 dark:text-gray-300">Click to upload a file</span>
                    <span className="text-gray-500 dark:text-gray-400">PNG, JPG, or WEBP (max 10MB)</span>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/png, image/jpeg, image/webp"
                    />
                </div>

                <div className="my-6 flex items-center">
                    <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                    <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-400">OR</span>
                    <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                </div>

                <button
                    onClick={startWebcam}
                    className="w-full flex items-center justify-center px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                    <CameraIcon className="w-6 h-6 mr-3" />
                    Use Webcam
                </button>
            </div>
            
            <canvas ref={canvasRef} className="hidden" />

            {isWebcamActive && <WebcamModal videoRef={videoRef} onCapture={capturePhoto} onClose={stopWebcam} />}
        </div>
    );
};

export default ImageInput;
