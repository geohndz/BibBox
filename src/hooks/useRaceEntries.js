import { useState, useEffect } from 'react';
import db from '../lib/db';
import { removeImageBackground, blobToDataURL, fileToDataURL, compressImage } from '../lib/imageProcessing';
import { parseGPX } from '../lib/gpxParser';

/**
 * Custom hook for managing race entries
 */
export function useRaceEntries() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load entries from IndexedDB
  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const allEntries = await db.raceEntries.orderBy('date').reverse().toArray();
      setEntries(allEntries);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load entries:', error);
      setLoading(false);
    }
  };

  const addEntry = async (entryData) => {
    try {
      const processedEntry = await processEntryImages(entryData);
      const id = await db.raceEntries.add({
        ...processedEntry,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await loadEntries();
      return id;
    } catch (error) {
      console.error('Failed to add entry:', error);
      throw error;
    }
  };

  const updateEntry = async (id, entryData) => {
    try {
      const processedEntry = await processEntryImages(entryData, id);
      await db.raceEntries.update(id, {
        ...processedEntry,
        updatedAt: new Date(),
      });
      await loadEntries();
    } catch (error) {
      console.error('Failed to update entry:', error);
      throw error;
    }
  };

  const deleteEntry = async (id) => {
    try {
      await db.raceEntries.delete(id);
      await loadEntries();
    } catch (error) {
      console.error('Failed to delete entry:', error);
      throw error;
    }
  };

  const getEntry = async (id) => {
    try {
      return await db.raceEntries.get(parseInt(id));
    } catch (error) {
      console.error('Failed to get entry:', error);
      throw error;
    }
  };

  return {
    entries,
    loading,
    addEntry,
    updateEntry,
    deleteEntry,
    getEntry,
    refreshEntries: loadEntries,
  };
}

/**
 * Process entry images - compress and remove backgrounds
 */
async function processEntryImages(entryData, existingId = null) {
  const processed = { ...entryData };

  // Process bib photo
  if (entryData.bibPhoto && entryData.bibPhoto instanceof File) {
    try {
      // Compress original
      const compressedOriginal = await compressImage(entryData.bibPhoto);
      const originalDataURL = await blobToDataURL(compressedOriginal);
      
      // Remove background
      let processedDataURL = originalDataURL;
      try {
        const processedBlob = await removeImageBackground(compressedOriginal);
        processedDataURL = await blobToDataURL(processedBlob);
      } catch (bgError) {
        console.warn('Background removal failed, using original:', bgError);
        // If background removal fails, use original
      }

      processed.bibPhoto = {
        original: originalDataURL,
        processed: processedDataURL,
        useProcessed: true,
      };
    } catch (error) {
      console.error('Failed to process bib photo:', error);
      // Fallback to data URL of original file
      const dataURL = await fileToDataURL(entryData.bibPhoto);
      processed.bibPhoto = {
        original: dataURL,
        processed: dataURL,
        useProcessed: false,
      };
    }
  } else if (entryData.bibPhoto && (typeof entryData.bibPhoto === 'object' && !(entryData.bibPhoto instanceof File))) {
    // Already processed (object with original/processed), keep as is (for updates)
    processed.bibPhoto = entryData.bibPhoto;
  } else if (entryData.bibPhoto && typeof entryData.bibPhoto === 'string') {
    // Legacy string format, convert to object format
    processed.bibPhoto = {
      original: entryData.bibPhoto,
      processed: entryData.bibPhoto,
      useProcessed: false,
    };
  }

  // Process finisher photo
  if (entryData.finisherPhoto && entryData.finisherPhoto instanceof File) {
    try {
      const compressed = await compressImage(entryData.finisherPhoto);
      processed.finisherPhoto = await blobToDataURL(compressed);
    } catch (error) {
      console.error('Failed to process finisher photo:', error);
      processed.finisherPhoto = await fileToDataURL(entryData.finisherPhoto);
    }
  } else if (entryData.finisherPhoto && (typeof entryData.finisherPhoto === 'string' || typeof entryData.finisherPhoto === 'object')) {
    // Already processed (string data URL or existing object), keep as is
    processed.finisherPhoto = entryData.finisherPhoto;
  }

  // Process medal photo
  if (entryData.medalPhoto && entryData.medalPhoto instanceof File) {
    try {
      const compressedOriginal = await compressImage(entryData.medalPhoto);
      const originalDataURL = await blobToDataURL(compressedOriginal);
      
      let processedDataURL = originalDataURL;
      try {
        const processedBlob = await removeImageBackground(compressedOriginal);
        processedDataURL = await blobToDataURL(processedBlob);
      } catch (bgError) {
        console.warn('Background removal failed for medal:', bgError);
      }

      processed.medalPhoto = {
        original: originalDataURL,
        processed: processedDataURL,
        useProcessed: true,
      };
    } catch (error) {
      console.error('Failed to process medal photo:', error);
      const dataURL = await fileToDataURL(entryData.medalPhoto);
      processed.medalPhoto = {
        original: dataURL,
        processed: dataURL,
        useProcessed: false,
      };
    }
  } else if (entryData.medalPhoto && (typeof entryData.medalPhoto === 'object' && !(entryData.medalPhoto instanceof File))) {
    // Already processed (object with original/processed), keep as is (for updates)
    processed.medalPhoto = entryData.medalPhoto;
  } else if (entryData.medalPhoto && typeof entryData.medalPhoto === 'string') {
    // Legacy string format, convert to object format
    processed.medalPhoto = {
      original: entryData.medalPhoto,
      processed: entryData.medalPhoto,
      useProcessed: false,
    };
  }

  // Process GPX file
  if (entryData.gpxFile && entryData.gpxFile instanceof File) {
    try {
      const routeData = await parseGPX(entryData.gpxFile);
      processed.routeData = routeData;
      processed.gpxFile = entryData.gpxFile.name; // Store filename
    } catch (error) {
      console.error('Failed to parse GPX file:', error);
      // Don't fail the whole entry if GPX parsing fails
    }
  } else if (entryData.routeData) {
    // Already processed
    processed.routeData = entryData.routeData;
  }

  return processed;
}
