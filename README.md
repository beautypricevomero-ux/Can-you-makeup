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

## Prova su smartphone
1. Avvia il server con host pubblico per la LAN:
   ```bash
   npm run dev -- --hostname 0.0.0.0
   ```
2. Individua l'indirizzo IP del tuo computer (es. `192.168.x.x`).
3. Dal browser dello smartphone, connesso alla stessa rete Wi-Fi, apri `http://<IP>:3000`.

L'interfaccia è ottimizzata per il tocco: timer, carte e pulsanti restano sempre raggiungibili grazie al layout mobile-first.

## Mock attivi
- `POST /api/shopify/products`: restituisce prodotti finti (Picsum) in base ai settori attivi.
- `POST /api/shopify/checkout`: reindirizza verso un checkout di esempio.
- `GET /api/shopify/verify-pass`: sempre `ok: true` nella demo.

Per passare a Shopify reale sostituisci le route con quelle del progetto completo.
