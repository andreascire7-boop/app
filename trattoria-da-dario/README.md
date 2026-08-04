# Trattoria da Dario — sito web

Sito statico (HTML/CSS/JS puro, nessuna build, nessun backend richiesto) per
Trattoria da Dario, Bagheria (PA).

## Contenuto

- `index.html` — pagina unica con sezioni: Home, La Storia, Menù, Galleria
  (link a Instagram), Recensioni, Dove Siamo, Contatti.
- `css/style.css` — stile (palette terracotta/oliva/crema ispirata alla
  Sicilia, font Fraunces + Manrope da Google Fonts).
- `js/main.js` — comportamento dinamico:
  - badge "aperti ora / chiusi, riapre alle…" calcolato in tempo reale
    sull'orario di Bagheria (Europe/Rome), aggiornato ogni minuto;
  - tab del menù (Antipasti/Primi/Secondi/Dolci);
  - nav mobile, scrollspy, animazioni "reveal" allo scroll, pulsante torna-su;
  - mappa Google incorporata sulle coordinate del locale;
  - CTA di prenotazione che apre WhatsApp con messaggio precompilato al
    numero del locale (+39 320 152 0902), coerente con come oggi prendono le
    prenotazioni.
- Dati strutturati `Restaurant` (JSON-LD) nell'`<head>` per la SEO locale
  (indirizzo, coordinate, orari, P.IVA, social).

## Come vederlo in locale

Basta aprire `index.html` in un browser, oppure servirlo con un server
statico qualsiasi, es.:

```bash
cd trattoria-da-dario
python3 -m http.server 8080
# poi apri http://localhost:8080
```

## Come pubblicarlo

È una cartella statica: si può pubblicare così com'è su Netlify, Vercel,
GitHub Pages o qualunque hosting statico, senza build step.

## Cosa manca e andrebbe aggiunto dal titolare

- **Foto reali** del locale, della terrazza e dei piatti: al momento la
  sezione "Storia" e "Galleria" usano illustrazioni/gradienti al posto di
  fotografie, perché non erano disponibili foto verificate da inserire.
  Sostituire con scatti reali alzerebbe molto la conversione.
- **Logo**: non esiste un logo proprio (verificato su Bagheria Experience,
  Facebook, directory). Il sito usa per ora un monogramma tipografico "D".
  Vale la pena commissionare un logo vero, coerente con l'identità
  "Villa Favazzi / cucina di mare".
- **Recensioni**: la sezione mostra solo i punteggi aggregati reali (Google/
  TripAdvisor/Sluurpy/Facebook) con link alle piattaforme, senza citazioni
  testuali inventate — se si vogliono mostrare recensioni testuali, andrebbero
  copiate/autorizzate dalle piattaforme originali.
- **Dominio e sito proprio**: attualmente il locale non ha un sito web; questo
  progetto colma quel vuoto ed è pronto per essere collegato a un dominio
  (es. trattoriadadario.it).
