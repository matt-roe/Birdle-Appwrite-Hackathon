import { Appwrite } from "appwrite";

export default () => {
  const appwrite = new Appwrite();

  appwrite
    .setEndpoint(window.__NUXT__.config.public.apiBase) // Your Appwrite Endpoint
    .setProject(window.__NUXT__.config.public.project);

  return appwrite;
};
