import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { configService, masterDataService } from '../services';
import { IMAGES as DEFAULT_IMAGES } from '../utils/constants';

const ConfigContext = createContext(null);

/**
 * Provider component for site configuration
 */
// Default text configs
const DEFAULT_TEXTS = {
  CERTIFICATION_PAGE_DESCRIPTION: 'Uyir Tech International is an ISO 9001 certified independent organization collaborated with Uyirgenetics Research Pvt Ltd, globally providing certification services and professional development training in Food Safety, FSMS, QMS, HACCP certification, and Industrial Microbiology Technical Programs for students, individuals, and organizations.\n\nCertification of your management system demonstrates your commitment to controlling hazards and managing the safety and quality of your products and services.',
  TESTING_PAGE_DESCRIPTION: 'At Uyir Tech Testing Lab, we understand the importance of quality assurance in today\'s competitive market. We offer a wide range of testing services, including blood culture testing, food product microbiology, and GMO analysis. Our experienced scientists and technicians use advanced equipment and methods to deliver accurate and reliable results.\n\nOur testing services ensure your products comply with both national and international regulations, giving you confidence in your quality assurance processes.',
};

export function ConfigProvider({ children }) {
  const [images, setImages] = useState(DEFAULT_IMAGES);
  const [texts, setTexts] = useState(DEFAULT_TEXTS);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load configurations on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);

        // Load images, texts, and categories in parallel
        const [imagesData, categoriesData, serviceTextsData] = await Promise.all([
          configService.getImages(),
          masterDataService.getCourseCategories(),
          configService.getByCategory('SERVICE').catch(() => ({})),
        ]);

        // Merge loaded images with defaults (loaded takes precedence)
        if (imagesData && Object.keys(imagesData).length > 0) {
          setImages((prev) => ({ ...prev, ...imagesData }));
        }

        // Merge loaded texts with defaults
        if (serviceTextsData && Object.keys(serviceTextsData).length > 0) {
          setTexts((prev) => ({ ...prev, ...serviceTextsData }));
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

  // Get text by key with fallback
  const getText = useCallback(
    (key, fallback = '') => {
      return texts[key] || DEFAULT_TEXTS[key] || fallback;
    },
    [texts]
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
    texts,
    categories,
    loading,
    error,
    getImage,
    getText,
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
