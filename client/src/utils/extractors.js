export const brandDisplayName = (project) =>
  project.brandProfile?.user?.name ||
  project.brandProfile?.businessName ||
  project.brand?.name ||
  project.brandName ||
  'Brand';

export const brandPhotoUrl = (project) =>
  project.brandProfile?.user?.avatarUrl ||
  project.brandProfile?.profilePhotoUrl ||
  project.brand?.profilePhoto ||
  project.brand?.photo ||
  null;

export const creatorDisplayName = (project) => {
  const profileId = project.creatorProfile?.id || project.creatorProfileId || '';
  const suffix = profileId.slice(0, 4).toUpperCase() || 'XXXX';
  return `Creator_${suffix}`;
};

export const creatorPhotoUrl = (project) =>
  project.creatorProfile?.user?.avatarUrl ||
  project.creatorPhotoUrl ||
  null;
