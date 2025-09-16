# Can You Makeup — MOCK

Demo pronta del gioco d'acquisto stile Tinder.

## Avvio rapido
```bash
npm install
npm run dev
# apri http://localhost:3000
```

## Cosa trovi
- **Home** con link diretti a gioco e configurazione.
- **/play** per provare lo swipe, con timer, selezione ponderata per settore e checkout mock.
- **/settings** per rinominare i settori, modificarne il peso percentuale e aggiornare gli handle delle collection.

Le modifiche alle impostazioni sono mantenute in memoria (restart = reset). Le API Shopify sono mock per facilitare la demo.

## Mock attivi
- `POST /api/shopify/products`: restituisce prodotti finti (Picsum) in base ai settori attivi.
- `POST /api/shopify/checkout`: reindirizza verso un checkout di esempio.
- `GET /api/shopify/verify-pass`: sempre `ok: true` nella demo.

Per passare a Shopify reale sostituisci le route con quelle del progetto completo.
