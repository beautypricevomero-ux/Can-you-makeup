# Checklist Shopify (rapida)

## Prodotti & Collezioni
- [ ] Crea collezioni: Occhi (handle: `occhi`), Labbra (`labbra`), Viso (`viso`)
- [ ] Aggiungi 3+ prodotti per collezione, con immagine, prezzo EUR, 1 variante

## Sconti
- [ ] Codice sconto `CANYOUMAKEUP30` attivo

## Pagamenti
- [ ] Attiva Shopify Payments (test) **o** Bogus Gateway
- [ ] Attiva PayPal (sandbox/standard)

## Storefront API
- [ ] Crea App di sviluppo
- [ ] Abilita lettura prodotti/collezioni in Storefront API
- [ ] Genera Public Storefront access token
- [ ] Annota il dominio `your-store.myshopify.com`

## Variabili ambiente (per versione reale)
```
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_TOKEN=...
SHOPIFY_DEFAULT_DISCOUNT_CODE=CANYOUMAKEUP30
NEXTAUTH_SECRET=stringa_lunga
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_DEFAULT_DISCOUNT_CODE=CANYOUMAKEUP30
```
