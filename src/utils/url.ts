/**
 * Vrai si `url` est un lien http(s) valide. À vérifier avant d'afficher un
 * lien saisi par un·e utilisateurice : bloque `javascript:`, `data:`…
 * (les règles Firestore ne valident pas encore les données).
 */
export const isHttpUrl = (url?: string): url is string => {
  if (!url) {
    return false;
  }

  try {
    const { protocol } = new URL(url);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
};
