# 5 post Instagram — contenuti da skill `scienze-motorie-sc`

Solo testo e concept: nessuna indicazione di design (i template sono già noti).
Ogni idea ha un brief sintetico + un prompt pronto da incollare a Claude.

Regola comune a tutti i prompt: i contenuti tecnici escono **solo** dalla skill
`scienze-motorie-sc`, niente numeri inventati, niente claim medici.

---

## 1. I residui d'allenamento — "quanto dura quello che hai costruito"

- **Fonte skill**: `references/periodizzazione.md` → Residui d'allenamento (Issurin & Lustig, 2004)
- **Hook**: "Stacchi 3 settimane. Cosa perdi davvero, e in che ordine?"
- **Nucleo**: velocità max ~5±3 gg · forza resistente ~15±5 · resistenza anaerobica ~18±4 ·
  forza max ~30±5 · resistenza aerobica ~30±5. Implicazione pratica: le qualità a residuo breve
  (velocità, potenza) si allenano vicino alla gara e si mantengono con stimoli frequenti; quelle a
  residuo lungo si costruiscono presto e si mantengono con poco.
- **Perché funziona**: numeri concreti e memorizzabili, risponde a una domanda che tutti si fanno
  (pausa, vacanza, stop forzato) → alto tasso di salvataggi.
- **Formato**: carosello 7 slide.

### Prompt

```
Usa la skill scienze-motorie-sc, reference periodizzazione.md (sezione "Residui d'allenamento"),
come UNICA fonte tecnica. Scrivi il testo di un carosello Instagram da 7 slide usando il template
carosello che già conosci.

Tema: i residui d'allenamento (Issurin & Lustig, 2004) — quanto tempo si mantiene un adattamento
dopo che lo stimolo si ferma.
Pubblico: atleti e preparatori di sport intermittenti (tennis/padel, sport di squadra), livello
intermedio, non accademico.
Angolo: "stacchi 3 settimane: cosa perdi davvero, e in che ordine?"

Struttura:
- Slide 1: hook forte, una riga, che promette la risposta
- Slide 2: il concetto di residuo in 2 frasi, senza gergo
- Slide 3-4: la scala dei residui con i giorni esatti della reference, ordinata dal più breve al
  più lungo, una riga di senso pratico per ciascuna qualità
- Slide 5: perché velocità e potenza hanno residuo breve (interazioni neuromuscolari fini) e
  aerobico/forza max lungo (adattamenti morfologici e strutturali)
- Slide 6: le 2 implicazioni operative sulla programmazione (cosa mettere vicino alla gara, cosa
  costruire presto e mantenere con poco)
- Slide 7: CTA (domanda in commenti + invito a salvare)

Output: testo slide per slide (max ~25 parole a slide, frasi brevi), poi caption 80-120 parole in
tono divulgativo-tecnico, poi 3 hook alternativi per la slide 1, poi 12-15 hashtag misti
(settore + nicchia).
Vincoli: usa solo i numeri presenti nella reference, con il "±"; niente promesse assolute; scrivi
con parole tue, non ricopiare la reference.
```

---

## 2. COD ≠ agilità — "la scaletta non ti rende agile"

- **Fonte skill**: `references/velocita-agilita.md` → Definizioni, COD vs agilità reattiva,
  Componenti dell'agilità
- **Hook**: "Se il drill è prevedibile, non stai allenando l'agilità."
- **Nucleo**: agilità = cambiare direzione/velocità **in risposta a uno stimolo**; T-test e 5-0-5
  misurano il COD, non l'agilità; la parte percettivo-cognitiva (scanning, riconoscimento pattern,
  anticipazione, decisione) è ciò che distingue l'atleta esperto; progressione chiuso →
  semi-aperto → aperto/reattivo. Ladder e dot drill: utili come riscaldamento/coordinazione, basso
  trasferimento diretto se usati da soli.
- **Perché funziona**: mito diffuso + immagine mentale familiare (la scaletta) = commenti e dibattito.
- **Formato**: carosello 6 slide, impianto mito → realtà → cosa fare.

### Prompt

```
Usa la skill scienze-motorie-sc, reference velocita-agilita.md (sezioni "Definizioni",
"COD vs agilità reattiva", "Componenti dell'agilità", "Allenamento dell'agilità e della
quickness"), come UNICA fonte tecnica. Scrivi il testo di un carosello Instagram da 6 slide con il
template carosello che già conosci.

Tema: la differenza tra cambio di direzione (COD) e agilità reattiva.
Pubblico: coach e preparatori di sport di situazione + atleti evoluti.
Angolo: mito da sfatare — "la scaletta di agilità non allena l'agilità".
Tono: diretto ma non arrogante; smonta il mito senza deridere chi lo usa.

Struttura:
- Slide 1: hook che nomina il mito
- Slide 2: definizione pulita di agilità (reazione a uno stimolo) vs COD (percorso pre-pianificato)
- Slide 3: perché i test chiusi (T-test, 5-0-5) misurano il COD e non l'agilità
- Slide 4: le componenti percettivo-cognitive (scanning, pattern, anticipazione, decisione) e
  perché sono quelle che separano l'atleta esperto
- Slide 5: cosa cambia in pratica — progressione chiuso → semi-aperto → aperto/reattivo, con 3
  esempi concreti di drill reattivi presi dalla reference
- Slide 6: il verdetto onesto sulla scaletta (utile come riscaldamento e coordinazione, insufficiente
  da sola) + CTA a commentare

Output: testo slide per slide (frasi brevi, max ~25 parole), caption 80-120 parole che chiude con
una domanda, 3 hook alternativi, 12-15 hashtag.
Vincoli: nessun numero o studio non presente nella reference; niente attacchi a persone o metodi
per nome.
```

---

## 3. L'ordine della seduta — "stessi esercizi, risultato diverso"

- **Fonte skill**: `references/program-design.md` → Struttura della seduta;
  `references/forza-potenza.md` → Selezione e ordine degli esercizi
- **Hook**: "Stessi esercizi, stesso tempo, risultato diverso: cambia solo l'ordine."
- **Nucleo**: riscaldamento (generale → mobilità → attivazione → specifico) → qualità prioritarie a
  SNC fresco (potenza/velocità/pliometria) → forza pesante multiarticolare → accessori →
  condizionamento/prehab. Regola: complesso e ad alta velocità prima di semplice e ad alto volume;
  grande prima di piccolo; alta intensità prima di alto volume.
- **Perché funziona**: applicabile subito, zero attrezzatura, formato "checklist" → salvataggi e
  condivisioni.
- **Formato**: carosello 6 slide.

### Prompt

```
Usa la skill scienze-motorie-sc, reference program-design.md (sezione "Struttura della seduta") e
forza-potenza.md (sezione "Selezione e ordine degli esercizi"), come UNICA fonte tecnica. Scrivi il
testo di un carosello Instagram da 6 slide con il template carosello che già conosci.

Tema: l'ordine degli esercizi dentro la seduta e perché cambia il risultato.
Pubblico: atleti intermedi e coach alle prime programmazioni.
Angolo: "stessi esercizi, stesso tempo, risultato diverso — cambia solo la sequenza".

Struttura:
- Slide 1: hook sul paradosso stessi esercizi / risultato diverso
- Slide 2: il principio in una riga (le qualità che dipendono dal sistema nervoso vanno a SNC fresco)
- Slide 3: la sequenza corretta della seduta, dal riscaldamento al defaticamento, come lista ordinata
- Slide 4: le 3 regole guida (complesso e veloce prima di semplice e voluminoso; grande prima di
  piccolo; alta intensità prima di alto volume) con una micro-spiegazione ciascuna
- Slide 5: l'errore tipico — condizionamento o accessori pesanti prima del lavoro esplosivo, e cosa
  succede alla qualità del movimento
- Slide 6: CTA a salvare il post come check pre-seduta

Output: testo slide per slide (max ~25 parole), caption 80-120 parole, 3 hook alternativi, 12-15
hashtag.
Vincoli: spiega sempre il perché, non solo la regola; niente set/rep inventati; se citi parametri
usa solo quelli presenti nelle reference.
```

---

## 4. Sistemi energetici — "alleni il sistema sbagliato"

- **Fonte skill**: `references/sistemi-energetici-condizionamento.md` → Contributo per durata,
  Work:rest; `references/velocita-agilita.md` → RSA
- **Hook**: "Lo scambio dura 8 secondi. Il tuo condizionamento ne dura 40 minuti."
- **Nucleo**: contributo per durata (0–10 s fosfageni · 10–30 s misto · 30 s–2 min glicolitico ·
  >3 min aerobico); negli sport intermittenti = scatti alattacidi ripetuti **su una base aerobica
  che serve al recupero**; work:rest per bersaglio (fosfageni 1:12–1:20, glicolitico 1:3–1:5,
  ossidativo 1:1–1:3); recupero PCr parziale in 30 s–1 min, quasi completo in 3–5 min.
- **Perché funziona**: la tabella work:rest è materiale da salvare; l'hook è provocatorio ma il post
  poi rende giustizia all'aerobico → dibattito sano invece che disinformazione.
- **Formato**: carosello 7 slide.

### Prompt

```
Usa la skill scienze-motorie-sc, reference sistemi-energetici-condizionamento.md (sezioni
"Contributo per durata", "Work:rest e progettazione degli intervalli", "I tre sistemi energetici") e
velocita-agilita.md (sezione "RSA"), come UNICA fonte tecnica. Scrivi il testo di un carosello
Instagram da 7 slide con il template carosello che già conosci.

Tema: scegliere il condizionamento in base alle richieste energetiche reali dello sport.
Pubblico: atleti e coach di sport intermittenti (tennis, padel, calcio, basket).
Angolo: "lo scambio dura 8 secondi, il tuo condizionamento ne dura 40 minuti".

Struttura:
- Slide 1: hook sul mismatch tra durata dell'azione e durata dell'allenamento
- Slide 2: i tre sistemi energetici in una riga ciascuno (potenza vs capacità)
- Slide 3: contributo per durata dello sforzo, con le fasce temporali della reference
- Slide 4: la correzione importante — negli sport intermittenti la base aerobica NON è inutile:
  è ciò che permette di recuperare tra le azioni e sostiene la RSA
- Slide 5: la tabella work:rest per bersaglio (fosfageni, glicolitico, ossidativo) con i rapporti
  della reference
- Slide 6: un esempio pratico di seduta RSA costruita con quei rapporti, usando solo i range della
  reference
- Slide 7: CTA a salvare + domanda su quale sistema domina nel loro sport

Output: testo slide per slide (max ~25 parole), caption 80-120 parole, 3 hook alternativi, 12-15
hashtag.
Vincoli: la slide 4 è obbligatoria, l'hook non deve diventare "il cardio è inutile"; usa solo i
rapporti e le durate presenti nella reference.
```

---

## 5. Carico e infortuni — "non è il carico alto, è il salto di carico"

- **Fonte skill**: `references/prevenzione-rehab-prehab.md` → Gestione del carico, Fattori di
  rischio, Prehab
- **Hook**: "Non ti sei fatto male perché ti allenavi tanto. Ti sei fatto male perché sei passato da
  poco a tanto."
- **Nucleo**: ACWR = carico dell'ultima settimana vs media delle ultime 4; i picchi bruschi alzano il
  rischio, una base cronica alta e ben costruita protegge; monotonia (alternare giorni alti/bassi);
  l'infortunio pregresso è il predittore più forte; molti infortuni non da contatto nascono
  dall'interazione fatica × carico × meccanica. ACWR come strumento di monitoraggio, non come legge.
- **Perché funziona**: tema ad alta rilevanza emotiva, riframing che cambia il modo di guardare la
  settimana di allenamento.
- **Formato**: carosello 6 slide.

### Prompt

```
Usa la skill scienze-motorie-sc, reference prevenzione-rehab-prehab.md (sezioni "Fattori di rischio",
"Gestione del carico", "Prehab: principi"), come UNICA fonte tecnica. Scrivi il testo di un carosello
Instagram da 6 slide con il template carosello che già conosci.

Tema: gestione del carico come leva di riduzione del rischio infortuni.
Pubblico: atleti amatoriali e agonisti + coach.
Angolo: "non è il carico alto a farti male, è il salto di carico".
Tono: educativo e responsabile, mai allarmistico.

Struttura:
- Slide 1: hook sul riframing (tanto vs salto da poco a tanto)
- Slide 2: acute:chronic workload ratio spiegato in 2 frasi senza formule (ultima settimana vs media
  delle ultime 4)
- Slide 3: il punto controintuitivo — una base cronica alta e costruita bene è protettiva, non
  rischiosa
- Slide 4: monotonia e varietà del carico settimanale (alternare giorni alti e bassi)
- Slide 5: i fattori di rischio principali, con l'infortunio pregresso come predittore più forte, e
  2-3 esempi di prehab mirato presi dalla reference
- Slide 6: disclaimer breve (contenuto educativo di performance, per dolore o infortunio in corso
  rivolgersi a medico/fisioterapista) + CTA

Output: testo slide per slide (max ~25 parole), caption 80-120 parole, 3 hook alternativi, 12-15
hashtag.
Vincoli: presenta l'ACWR come strumento di monitoraggio da interpretare nel contesto, non come
legge; nessun protocollo clinico o consiglio individuale; nessun numero non presente nella
reference.
```

---

## Idee di riserva (stessa skill)

- **Interferenza / concurrent training** (`sistemi-energetici-condizionamento.md`): "il cardio ti
  ruba la forza? dipende da quando lo fai" — separare le sedute ~6+ h, mettere prima la qualità
  prioritaria, modalità a basso impatto eccentrico vicino alle sedute di gambe.
- **La finestra anabolica** (`nutrizione.md`): è più ampia di quanto si credeva; contano totale
  giornaliero e distribuzione in 3-5 pasti da ~0.3-0.4 g/kg.
- **Tapering** (`periodizzazione.md`): tagliare il volume 40-60%, tenere alta l'intensità — perché
  funziona (la fatica decade più in fretta del fitness).
