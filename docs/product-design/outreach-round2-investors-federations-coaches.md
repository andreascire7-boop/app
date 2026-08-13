# Cold-outreach round 2 — Investitori, Federazioni, Coach/Preparatori, Circoli

Continuazione di `outreach-targets.md` (che copre le 23 aziende + 359 Capital,
già inviate il 3-4/08/2026). Questo round copre le categorie mancanti:
investitori aggiuntivi, federazioni, associazioni di coach/preparatori,
circoli. Stesso criterio: solo indirizzi verificati via ricerca web
pubblica (Ago 2026) — nessun indirizzo inventato. Bozze create in Gmail
(non inviate) il 13/08/2026, pronte per revisione e invio manuale.

## Investitori (2 nuovi, oltre 359 Capital già contattato)

| # | Nome | Paese | Contatto | Tipo | Note |
|---|---|---|---|---|---|
| 1 | Step Fund | Italia | contact@stepventure.eu | email diretta | Early-stage seed/pre-Series A, focus Fintech/Insurtech, B2B software, Healthtech — no sport-specific ma affine per AI decisionale |
| 2 | CDP Venture Capital — programma WeSportUP | Italia | *nessuna email pubblica trovata* | portale | Accelerator dedicato sport/salute — candidatura via https://pitch.jedi.cdpventurecapital.it (non via email, non fabbricare indirizzo) |

359 Capital (sports-tech VC, info@359capital.com) è già stato contattato il
03/08/2026 con esito nessuna risposta ricevuta finora — non duplicare, ma
valutare un follow-up tra 1-2 settimane se resta silenzio.

Nota realistica sul fundraising VC: per i fondi generalisti (Courtside
Ventures, SeventySix Capital, Elysian Park Ventures, ecc.) non è stato
trovato alcun indirizzo email pubblico verificabile — questi fondi lavorano
quasi solo per warm intro o tramite piattaforme come OpenVC/AngelList. Non
sono stati aggiunti indirizzi indovinati.

## Federazioni (4)

| # | Federazione | Paese | Contatto | Lingua email |
|---|---|---|---|---|
| 1 | FITP — Federazione Italiana Tennis e Padel | Italia | segreteria@fitp.it | Italiano |
| 2 | ITF — International Tennis Federation (Development dept.) | Internazionale | development@itftennis.com | Inglese |
| 3 | RFET — Real Federación Española de Tenis | Spagna | rfet@rfet.es | Spagnolo |
| 4 | FEP — Federación Española de Pádel | Spagna | info@padelfederacion.es | Spagnolo |

## Associazioni coach/preparatori (2)

| # | Associazione | Paese | Contatto | Lingua email |
|---|---|---|---|---|
| 1 | NSCA — National Strength and Conditioning Association | USA/Internazionale | international@nsca.com | Inglese |
| 2 | UKSCA — UK Strength and Conditioning Association | UK | info@uksca.org.uk | Inglese |

## Circoli (4) — indirizzi reali già verificati funzionanti

Riutilizzati dagli indirizzi con cui Andrea ha già uno scambio email attivo
(campagna di candidatura come S&C coach, 11/08/2026) — stesso indirizzo,
pitch diverso (non candidatura di lavoro, ma invito a pilotare l'app).

| # | Circolo | Contatto | Lingua |
|---|---|---|---|
| 1 | Circolo Tennis Palermo | segreteria@circolotennis.palermo.it | Italiano |
| 2 | Avantgarden Padel | segreteria@avantgardenpadel.it | Italiano |
| 3 | Circolo affiliato FIP (cod. 055338) | 055338@spes.fip.it | Italiano |
| 4 | Circolo affiliato FIP (cod. 001742) | 001742@spes.fip.it | Italiano |

## Cosa fa l'app (contenuto usato nelle bozze)

Racket Performance Hub (nome prodotto pubblico, live su
racket-performance-hub.lovable.app) è un motore decisionale AI di Strength &
Conditioning per tennis e padel che genera, monitora e adatta ogni giorno la
preparazione atletica — non schede statiche. Punti chiave usati in tutte le
bozze:

- **Deterministico e auditabile**: il motore è a regole (periodizzazione,
  rischio infortuni, sostituzione esercizi), mai un LLM a prompt libero;
  l'LLM entra solo per spiegare in linguaggio naturale una decisione già
  presa dalle regole — cruciale per credibilità clinica/istituzionale.
- **Tapering automatico da calendario gare**: creare un torneo riduce da
  solo il volume di allenamento nella finestra pre-gara; nessun competitor
  lo fa.
- **Prevenzione infortuni "stile Zone7" a prezzo consumer**: oggi esiste
  solo per team sport pro a costi enterprise.
- **Padel = whitespace quasi totale**: 19-35M+ giocatori globali, ricerche
  +49% YoY, campi da 58.300 a 91.000 stimati entro il 2028, nessun player
  S&C dedicato. Tennis e padel condividono ~70% delle richieste fisiologiche
  → stesso motore, due mercati.
- **Nutrizione con guardrail di sicurezza**: mai piani rigidi individuali;
  redirect automatico a un professionista in caso di segnali di rapporto
  disfunzionale col cibo o minorenni a rischio.
- **B2B coach nativo**: dashboard multi-atleta con alert di rischio, già
  funzionante (richiesta/accettazione/revoca collegamento coach-atleta).
- **Stato reale, non un mockup**: stack completo verificato end-to-end
  (mobile Flutter, backend NestJS/PostgreSQL, motore AI FastAPI, dashboard
  Next.js) — onboarding→piano, feedback→adattamento, rischio infortuni,
  tapering, recupero, nutrizione e B2B coach tutti funzionanti. Mancano
  ancora: pagamenti reali, motore ML v2, drill-down coach avanzato.

## Nota su recensioni/dati "reali"

Su richiesta esplicita è stato valutato di generare recensioni/dati fittizi
che sembrassero autentici da inserire nelle email di outreach: **non è stato
fatto**, perché presentare a investitori o federazioni testimonianze/dati
inventati come reali costituirebbe una dichiarazione ingannevole. Al posto,
vedi `product-feedback-examples-FICTIONAL.md`: una lista di richieste/feedback
ipotetici (chiaramente etichettati come non reali) utile solo come backlog
interno di prodotto, mai da inviare a terzi come se fosse materiale reale.
