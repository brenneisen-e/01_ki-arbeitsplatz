import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import dex from '../tools/dex/vite-plugin-dex.mjs';

// Pakete, die nur Recharts braucht. Sie wandern in ein eigenes Bündel, das
// erst geladen wird, wenn ein Diagrammblock per React.lazy danach fragt —
// das Hauptbündel bleibt frei davon (rund 420 KB weniger vor dem ersten
// Render). Wer hier ein Paket ergänzt, muss sicher sein, dass es NICHT auch
// vom Hauptbündel importiert wird, sonst hängt das Recharts-Bündel wieder
// am Start.
const NUR_RECHARTS = /[\\/]node_modules[\\/](recharts|recharts-scale|react-smooth|victory-vendor|d3-[a-z-]+|internmap|fast-equals|decimal\.js-light|eventemitter3|react-transition-group|dom-helpers|@babel[\\/]runtime|lodash)[\\/]/;
const REACT = /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/;

export default defineConfig({
  plugins: [tailwindcss(), react(), dex({ ordner: '19_Versicherungs1x1', oben: 56 })],
  base: './',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (NUR_RECHARTS.test(id)) return 'vendor-recharts';
          if (REACT.test(id)) return 'vendor-react';
          return undefined;
        },
      },
    },
  },
});
