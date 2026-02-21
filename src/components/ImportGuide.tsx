import React, { useState, useEffect } from 'react';

const IMAGES = [
    '/import-guide-1.png',
    '/import-guide-2.png',
    '/import-guide-3.png'
];

export const ImportGuide: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % IMAGES.length);
            setHasError(false); // Reset error state on slide change to try loading next image
        }, 3000); // Change image every 3 seconds

        return () => clearInterval(interval);
    }, []);

    if (hasError) {
        return (
            <div className="w-full h-48 bg-slate-100 rounded-md mb-4 flex items-center justify-center border text-gray-500 text-sm flex-col gap-2">
                <p>画像が見つかりません</p>
                <p className="text-xs">publicフォルダに以下の画像を配置してください:</p>
                <code className="text-xs bg-slate-200 px-1 py-0.5 rounded">import-guide-1.png, -2.png, -3.png</code>
            </div>
        )
    }

    return (
        <div className="w-full h-auto min-h-[150px] bg-slate-50 rounded-md mb-4 overflow-hidden relative border aspect-video">
            {IMAGES.map((src, index) => (
                <img
                    key={src}
                    src={src}
                    alt={`Import Step ${index + 1}`}
                    onError={() => setHasError(true)}
                    className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ${index === currentIndex ? 'opacity-100' : 'opacity-0'
                        }`}
                />
            ))}

            {/* Dots Indicator */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {IMAGES.map((_, index) => (
                    <div
                        key={index}
                        className={`w-2 h-2 rounded-full ${index === currentIndex ? 'bg-blue-600' : 'bg-slate-300'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};
