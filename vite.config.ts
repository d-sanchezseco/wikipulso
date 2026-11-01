import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Open Graph exige URLs absolutas, así que el dominio se sustituye en el HTML
 * durante el build. El valor vive aquí y no en un .env porque .gitignore ignora
 * los .env: uno commiteado no llegaría al build de producción y las etiquetas
 * saldrían con el marcador sin sustituir. Se puede sobrescribir con la variable
 * de entorno VITE_SITE_URL sin tocar el código.
 */
const SITE_URL = process.env.VITE_SITE_URL ?? 'https://wikipulso.vercel.app'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'wikipulso-site-url',
      transformIndexHtml: (html) => html.replaceAll('%VITE_SITE_URL%', SITE_URL),
    },
  ],
})
