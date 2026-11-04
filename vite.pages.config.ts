import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';
// Static client build for Cloudflare Pages. Supabase enforces database access.
export default defineConfig({root:'pages',publicDir:fileURLToPath(new URL('./public',import.meta.url)),plugins:[react()],build:{outDir:'../pages-dist',emptyOutDir:true}});
