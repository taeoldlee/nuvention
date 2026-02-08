import { useState, useRef } from 'react';

export default function useCreatorOnboardingForm() {
  const fileInputRef = useRef(null);

  // Step 0 — Profile
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [instagram, setInstagram] = useState('');
  const [tiktok, setTiktok] = useState('');

  // Step 1 — Style & Neighborhoods
  const [contentStyles, setContentStyles] = useState([]);
  const [strengths, setStrengths] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [dreamBrands, setDreamBrands] = useState([]);
  const [brandInput, setBrandInput] = useState('');

  // Step 2 — Portfolio
  const [portfolioFiles, setPortfolioFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

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
    const newFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    const combined = [...portfolioFiles, ...newFiles].slice(0, 6);
    setPortfolioFiles(combined);
    const newPreviews = combined.map((file) => URL.createObjectURL(file));
    previews.forEach((url) => URL.revokeObjectURL(url));
    setPreviews(newPreviews);
  };

  const removeFile = (index) => {
    URL.revokeObjectURL(previews[index]);
    setPortfolioFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const canProceedFromStep = (step) => {
    if (step === 0) return displayName.trim().length > 0 && bio.trim().length > 0;
    if (step === 1) return contentStyles.length > 0 && strengths.length > 0 && neighborhoods.length > 0;
    if (step === 2) return portfolioFiles.length >= 3;
    return true;
  };

  const buildProfileData = () => ({
    displayName: displayName.trim(),
    bio: bio.trim(),
    instagram: instagram.trim() || undefined,
    tiktok: tiktok.trim() || undefined,
    contentStyles,
    strengths,
    neighborhoods,
    dreamBrands: dreamBrands.length > 0 ? dreamBrands : undefined,
  });

  return {
    fileInputRef,
    displayName, setDisplayName,
    bio, setBio,
    instagram, setInstagram,
    tiktok, setTiktok,
    contentStyles, setContentStyles,
    strengths, setStrengths,
    neighborhoods, setNeighborhoods,
    dreamBrands, brandInput, setBrandInput,
    portfolioFiles, previews,
    toggleItem, addDreamBrand, removeDreamBrand,
    handleFilesSelected, removeFile,
    canProceedFromStep, buildProfileData,
  };
}
