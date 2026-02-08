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

export const creatorDisplayName = (project) =>
  project.creatorProfile?.user?.name ||
  project.creatorName ||
  '';

export const creatorPhotoUrl = (project) =>
  project.creatorProfile?.user?.avatarUrl ||
  project.creatorPhotoUrl ||
  null;
