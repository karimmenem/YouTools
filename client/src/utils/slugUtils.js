export const createSlug = (name, id) => {
  if (!name) return id;
  const slug = name
    .toLowerCase()
    .normalize('NFD') // separate accents from letters
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric with dashes
    .replace(/(^-|-$)+/g, ''); // remove leading/trailing dashes
  
  return `${slug}-${id}`;
};

export const getIdFromSlug = (slug) => {
  if (!slug) return null;
  const parts = slug.split('-');
  return parts[parts.length - 1];
};
