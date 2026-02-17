import { useState, useRef, useEffect } from 'react';

export default function useCreatorOnboardingForm() {
  const fileInputRef = useRef(null);
  const previewsRef = useRef([]);

  // Step 0 — Profile
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [instagram, setInstagram] = useState('');
  const [tiktok, setTiktok] = useState('');

  // Step 1 — Style & Neighborhoods
  const [contentStyles, setContentStyles] = useState([]);
  const [strengths, setStrengths] = useState([]);
  const [cuisineSpecialties, setCuisineSpecialties] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [dreamBrands, setDreamBrands] = useState([]);
  const [brandInput, setBrandInput] = useState('');

  // Step 2 — Portfolio
  const [portfolioFiles, setPortfolioFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  // Imported portfolio from social media scraping
  const [importedPortfolio, setImportedPortfolio] = useState([]);
  const [vibeTags, setVibeTags] = useState([]);
  const [originalBio, setOriginalBio] = useState('');
  const [confidence, setConfidence] = useState({});

  // Keep ref in sync and revoke all URLs on unmount
  useEffect(() => {
    previewsRef.current = previews;
  }, [previews]);
  useEffect(() => {
    return () => {
      previewsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const toggleItem = (arr, setArr, item) => {
    setArr((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  const addDreamBrand = () => {
    const value = brandInput.trim();
    if (value && !dreamBrands.includes(value)) {
      setDreamBrands((prev) => [...prev, value]);
    }
    setBrandInput('');
  };

  const removeDreamBrand = (brand) => {
    setDreamBrands((prev) => prev.filter((b) => b !== brand));
  };

  const handleFilesSelected = (files) => {
    const newFiles = Array.from(files).filter((f) => f.type.startsWith('image/') || f.type.startsWith('video/'));
    const combined = [...portfolioFiles, ...newFiles].slice(0, 6);
    setPortfolioFiles(combined);
    const newPreviews = combined.map((file) => ({ url: URL.createObjectURL(file), type: file.type }));
    previews.forEach((p) => URL.revokeObjectURL(p.url || p));
    setPreviews(newPreviews);
  };

  const removeFile = (index) => {
    URL.revokeObjectURL(previews[index]?.url || previews[index]);
    setPortfolioFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeImportedPortfolioItem = (index) => {
    setImportedPortfolio((prev) => prev.filter((_, i) => i !== index));
  };

  const applyImportData = (data) => {
    if (data.bio) setBio(data.bio);
    if (data.originalBio) setOriginalBio(data.originalBio);
    if (data.contentStyles?.length) setContentStyles(data.contentStyles);
    if (data.strengths?.length) setStrengths(data.strengths);
    if (data.neighborhoods?.length) setNeighborhoods(data.neighborhoods);
    if (data.cuisineSpecialties?.length) setCuisineSpecialties(data.cuisineSpecialties);
    if (data.vibeTags?.length) setVibeTags(data.vibeTags);
    if (data.importedPortfolio?.length) setImportedPortfolio(data.importedPortfolio);
    if (data.confidence) setConfidence(data.confidence);
  };

  const canProceedFromStep = (step) => {
    if (step === 0) return displayName.trim().length > 0 && bio.trim().length > 0;
    if (step === 1) return contentStyles.length > 0 && strengths.length > 0 && neighborhoods.length > 0;
    if (step === 2) return portfolioFiles.length >= 2;
    return true;
  };

  // For 2-step import flow: can proceed from import step
  const canProceedFromImport = (step) => {
    if (step === 0) return displayName.trim().length > 0;
    if (step === 1) return displayName.trim().length > 0 && bio.trim().length > 0 && contentStyles.length > 0 && strengths.length > 0 && neighborhoods.length > 0;
    return true;
  };

  const buildProfileData = () => ({
    displayName: displayName.trim(),
    bio: bio.trim(),
    instagramHandle: instagram.trim() || undefined,
    tiktokHandle: tiktok.trim() || undefined,
    contentStyles,
    strengths,
    neighborhoods,
    dreamBrands: dreamBrands.length > 0 ? dreamBrands : undefined,
    cuisineSpecialties: cuisineSpecialties.length > 0 ? cuisineSpecialties : undefined,
    vibeTags: vibeTags.length > 0 ? vibeTags : undefined,
  });

  return {
    fileInputRef,
    displayName, setDisplayName,
    bio, setBio,
    instagram, setInstagram,
    tiktok, setTiktok,
    contentStyles, setContentStyles,
    strengths, setStrengths,
    cuisineSpecialties, setCuisineSpecialties,
    neighborhoods, setNeighborhoods,
    dreamBrands, brandInput, setBrandInput,
    portfolioFiles, previews,
    importedPortfolio, vibeTags, originalBio, confidence,
    toggleItem, addDreamBrand, removeDreamBrand,
    handleFilesSelected, removeFile,
    removeImportedPortfolioItem, applyImportData,
    canProceedFromStep, canProceedFromImport, buildProfileData,
  };
}
