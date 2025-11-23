import { useState } from 'react';

/**
 * Component for toggling between original and processed images
 */
export function ImageToggle({ original, processed, useProcessed = true, alt = '' }) {
  const [showProcessed, setShowProcessed] = useState(useProcessed);

  const currentImage = showProcessed ? processed : original;
  const hasBothVersions = original && processed && original !== processed;

  if (!currentImage) return null;

  return (
    <div className="relative group">
      <img
        src={currentImage}
        alt={alt}
        className="w-full h-auto rounded-lg shadow-md"
      />
      {hasBothVersions && (
        <button
          onClick={() => setShowProcessed(!showProcessed)}
          className="absolute bottom-2 right-2 bg-black/60 hover:bg-black/80 text-white px-3 py-1.5 rounded-md text-sm transition-colors"
          title={showProcessed ? 'Show original' : 'Show processed'}
        >
          {showProcessed ? 'Original' : 'Processed'}
        </button>
      )}
    </div>
  );
}
