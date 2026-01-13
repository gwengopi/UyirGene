import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { configService, masterDataService } from '../services';
import { IMAGES as DEFAULT_IMAGES } from '../utils/constants';

const ConfigContext = createContext(null);

/**
 * Provider component for site configuration
 */
export function ConfigProvider({ children }) {
  const [images, setImages] = useState(DEFAULT_IMAGES);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load configurations on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);

        // Load images and categories in parallel
        const [imagesData, categoriesData] = await Promise.all([
          configService.getImages(),
          masterDataService.getCourseCategories(),
        ]);

        // Merge loaded images with defaults (loaded takes precedence)
        if (imagesData && Object.keys(imagesData).length > 0) {
          setImages((prev) => ({ ...prev, ...imagesData }));
        }

        if (categoriesData) {
          setCategories(categoriesData);
        }
      } catch (err) {
        console.error('Failed to load site configuration:', err);
        setError(err.message);
        // Keep using defaults on error
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  // Refresh images
  const refreshImages = useCallback(async () => {
    try {
      configService.clearImageCache();
      const imagesData = await configService.getImages();
      if (imagesData && Object.keys(imagesData).length > 0) {
        setImages((prev) => ({ ...prev, ...imagesData }));
      }
    } catch (err) {
      console.error('Failed to refresh images:', err);
    }
  }, []);

  // Refresh categories
  const refreshCategories = useCallback(async () => {
    try {
      masterDataService.clearCache();
      const categoriesData = await masterDataService.getCourseCategories();
      if (categoriesData) {
        setCategories(categoriesData);
      }
    } catch (err) {
      console.error('Failed to refresh categories:', err);
    }
  }, []);

  // Get image by key with fallback
  const getImage = useCallback(
    (key, fallback = '') => {
      return images[key] || DEFAULT_IMAGES[key] || fallback;
    },
    [images]
  );

  // Get category options for dropdowns
  const getCategoryOptions = useCallback(() => {
    return categories.map((cat) => ({
      value: cat.code,
      label: cat.label,
    }));
  }, [categories]);

  const value = {
    images,
    categories,
    loading,
    error,
    getImage,
    getCategoryOptions,
    refreshImages,
    refreshCategories,
  };

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

/**
 * Hook to access site configuration
 */
export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}

export default ConfigContext;
