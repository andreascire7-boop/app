# Piano di vendita — S&C Intelligence Platform (Tennis & Padel)

Piano operativo, non teorico: cosa vendere, a chi, con cosa, e cosa fare questa
settimana. Si appoggia su decisioni già prese in
[`PRD-strength-conditioning-tennis-padel.md`](PRD-strength-conditioning-tennis-padel.md)
FASE 8 (modello di business, pricing) e su
[`outreach-targets.md`](outreach-targets.md) (già pronto, canale separato — vedi
§4.3). Questo documento aggiunge quello che mancava: un motore di **vendita diretta**
a chi userà davvero il prodotto (atleti, coach, club), non solo la lista di
partnership B2B2B con aziende tech.

## 1. Stato reale del prodotto (onestà prima di tutto)

Quello che **esiste ed è dimostrabile oggi**, non su slide:

- Motore AI a regole, deterministico e auditabile (`ai-engine/`): periodizzazione,
  rischio infortuni (ACWR), sostituzione esercizi/RTP, tapering calendario-gare,
  autoregolazione da RPE, readiness, nutrizione con guardrail di sicurezza, e —
  aggiunto in questa sessione — **velocità/agilità e condizionamento energetico**
  (sprint, RSA, target di sistema energetico) specifico per sport intermittenti.
- Backend NestJS + Postgres reale, dashboard coach web (lista atleti + drill-down
  per rischio), app Flutter (onboarding → primo piano → sessione guidata →
  calendario → centro rischio → hub nutrizionale).
- Flusso self-service: un atleta può provare l'app dal browser senza installare
  nulla (`web-dashboard`, pulsante "Prova l'app come atleta").
- Deploy one-click gratuito documentato in `infra/DEPLOY.md` (Render + Vercel,
  nessuna carta di credito).

Quello che **non c'è ancora** — e va detto chiaro a chiunque, non nascosto:

- **Pagamenti reali**: lo scaffolding (`subscriptions.service.ts`) è esplicitamente
  "DEV-MODE, non addebita nessuna carta". Prima di incassare un solo euro serve
  Stripe o RevenueCat collegati (FASE 9 M3.1).
- **Validazione clinica esterna** (FASE 9 M2.6, bloccante P0): nessun coach/fisio
  indipendente ha ancora rivisto le regole del motore. Finché non è fatta, il
  claim vendibile è "assistente di programmazione intelligente e trasparente",
  **non** "riduce gli infortuni" — quel claim si guadagna con i dati, non si
  dichiara prima.
- Nessun caso studio, nessuna riprova sociale, nessun utente pagante reale.

Conseguenza diretta per il piano di vendita: **fase 1 non è "vendere", è
"validare con utenti reali gratis, raccogliere prove, poi accendere il
pagamento"**. Vendere prima di avere 10-20 utenti attivi reali sarebbe bruciare la
prima impressione sull'unico asset che conta davvero in questo mercato: la fiducia.

## 2. A chi vendiamo, in ordine

Sequenza raccomandata già in PRD §8.3, resa operativa:

| Fase | Chi | Come si raggiunge | Obiettivo |
|---|---|---|---|
| 0 (ora) | Beta gratuita: 15-30 giocatori padel/tennis + 3-5 coach/preparatori | Rete diretta di Andrea (scienze motorie) + club locali | Validare prodotto, raccogliere feedback/testimonianze, dati reali per la validazione clinica |
| 1 (mese 2-3) | B2C paganti: giocatori amatoriali seri (2-4 allenamenti/sett.) che già pagano un preparatore o un'app | Contenuti + passaparola dalla beta + coach come canale | Primi €, validare pricing |
| 2 (mese 4-6) | B2B coach/club: preparatori che seguono più atleti, circoli padel/tennis | Demo diretta dashboard coach, dai coach già in beta | Ticket più alto, effetto leva (1 coach → N atleti) |
| 3 (mese 6-12) | Accademie/federazioni + partnership tech (`outreach-targets.md`) | Case study dalla fase 1-2 come prova, poi outreach già pronto | Contratti pluriennali / licensing / way in per exit |

**Perché il padel prima del tennis in Italia**: mercato in crescita rapida, community
via club fisici molto più densa e raggiungibile di persona rispetto al tennis
tradizionale, meno saturo di app concorrenti verticali — coerente con la scelta già
fatta nel PRD di lanciare la beta su padel.

## 3. Pricing — cosa proporre ora, non cosa incassare ora

Riprende PRD §8.4, con l'aggiunta della fase "prezzo mostrato ma non addebitato"
richiesta dallo stato reale del prodotto (§1):

| Tier | Prezzo indicativo | In fase 0 (beta) |
|---|---|---|
| Free | €0 | invariato |
| Premium | €9,99-14,99/mese | **gratis per i beta tester**, prezzo mostrato in UI per validare la percezione ("varrebbe questo?") |
| Pro | €19,99-24,99/mese | non proposto in beta |
| B2B/atleta (coach) | €4-8/atleta/mese | coach beta gratis, poi primo a pagare dopo la beta |

Non fissare il prezzo finale prima di aver chiesto esplicitamente ai beta tester,
alla fine delle 6-8 settimane, una domanda a valore percepito diretta: *"quanto
pagheresti al mese per continuare a usarlo così com'è?"* — è il metodo di pricing
già scelto nel PRD (valore percepito), reso concreto con una domanda vera invece
che una tabella teorica.

## 4. Canali e motore di vendita

### 4.1 Founder-led sales diretto (motore primario, fase 0-2)

Il canale più veloce ora è la rete personale di Andrea come professionista di
scienze motorie — non outreach a freddo verso sconosciuti. Playbook:

1. Lista di 15-30 persone conosciute (atleti padel/tennis seri, colleghi
   preparatori, coach di club frequentati) — contatto diretto (messaggio
   personale, non email broadcast).
2. Messaggio tipo (adattare per persona, non copiare-incollare identico):

   > Ciao [nome], sto testando in beta gratuita uno strumento che ho costruito
   > per programmare l'allenamento di forza/condizionamento per tennis e padel
   > — periodizzazione, prevenzione infortuni, gestione calendario gare, tutto
   > adattivo e spiegato, non solo una scheda fissa. Ti va di provarlo per
   > qualche settimana e dirmi cosa ne pensi? Ci metti 5 minuti, gira dal
   > browser, nessuna carta di credito.

3. Ogni sì → link self-service (`infra/DEPLOY.md` → URL pubblico) + check-in
   personale a 1 settimana e a 4 settimane (non aspettare che scrivano loro).
4. Ogni coach in beta → chiedere esplicitamente 2-3 nomi di altri
   atleti/colleghi da invitare (motore di crescita "quasi-virale" di PRD §8.5,
   reso operativo come richiesta esplicita, non passiva).

### 4.2 Contenuti (motore secondario, da mese 1)

Il differenziatore vendibile è la **spiegabilità**: il motore dice *perché*
prescrive quel volume o quella sostituzione esercizio, non solo cosa fare. È
materiale da contenuto breve (Reels/TikTok/LinkedIn):

- Serie "il motore spiega": screenshot reale di una decisione (es. taper
  calendario-gare, sostituzione esercizio per dolore a spalla) + spiegazione in
  30-45 secondi di perché.
- Non promettere risultati clinici (§1) — il messaggio è "trasparenza e
  personalizzazione", non "previene infortuni" finché non è validato.

### 4.3 Partnership B2B2B (canale già pronto, fase 3, in parallelo a bassa priorità)

`outreach-targets.md` è già pronto e verificato (24 aziende, contatti reali,
template email) — ma è un canale **diverso**: non vende il prodotto ad atleti,
propone partnership/licensing/ingredient-deal ad aziende tech (wearable,
force-plate, monitoraggio). Ha senso attivarlo **dopo** aver dimostrato trazione
reale (fase 1-2), perché senza utenti/dati reali la proposta di partnership è
debole. Nessuna modifica necessaria a quel file ora — resta pronto per quando
la fase 3 lo richiede; non inviare a freddo prima di allora.

## 5. Piano a 90 giorni

**Settimane 1-2 — Setup e primi inviti**
- [ ] Confermare/rifare il deploy pubblico live (`infra/DEPLOY.md`, ~10 min,
      gratis) e verificare che il link self-service funzioni end-to-end da un
      telefono vero.
- [ ] Compilare la lista di 15-30 contatti diretti (§4.1).
- [ ] Primi 10 inviti personali.
- [ ] Aprire un foglio/tracker semplice: nome, data invito, stato (invitato →
      attivo → check-in 1 sett. → check-in 4 sett. → feedback raccolto).

**Settimane 3-6 — Beta attiva**
- [ ] Restanti inviti fino a 15-30 utenti attivi.
- [ ] Check-in personale a 1 settimana su ogni utente attivo.
- [ ] Iniziare la serie di contenuti "il motore spiega" (1-2 a settimana).
- [ ] Raccogliere almeno 3 coach disposti a provare la dashboard multi-atleta.

**Settimane 7-10 — Raccolta prove e primo pricing test**
- [ ] Check-in a 4 settimane su tutti: intervista breve (cosa ha funzionato,
      cosa no, quanto pagherebbe — §3).
- [ ] Selezionare 2-3 storie utente concrete (con permesso) come case study.
- [ ] Avviare la validazione clinica esterna con un coach/fisio indipendente
      (PRD M2.6) usando i dati reali raccolti in beta.

**Settimane 11-13 — Accensione pagamenti**
- [ ] Collegare Stripe (o RevenueCat) alla scaffolding esistente — sblocca
      finalmente incassi reali.
- [ ] Proporre il tier Premium a pagamento ai beta tester più attivi, con
      sconto "early adopter" come ringraziamento.
- [ ] Primo coach pagante sulla dashboard B2B.
- [ ] Solo a questo punto: prima ondata (bassa priorità, non broadcast) del
      canale partnership §4.3, con il case study reale come apertura.

## 6. Metriche da tracciare (poche, ma vere)

- Inviti mandati → attivazioni (tasso di conversione dell'invito personale).
- Utenti attivi a 1 settimana / a 4 settimane (retention, non solo signup).
- Numero di check-in completati (qualità del follow-up, non solo quantità di
  inviti).
- Risposta alla domanda di valore percepito (§3) — distribuzione dei prezzi
  dichiarati, non media sola.
- Coach → atleti invitati (tasso di leva del canale coach).

## 7. Prossime azioni immediate (questa settimana)

1. Verificare/rifare il deploy pubblico (`infra/DEPLOY.md`) e testare il link da
   telefono.
2. Scrivere la lista dei primi 15-30 contatti diretti.
3. Mandare i primi 5 inviti personali (non in blocco — uno a uno, personalizzati).
4. Aprire il tracker beta (anche solo un foglio Google Sheets).
5. **Non** toccare `outreach-targets.md` finché non c'è almeno un primo case
   study reale (§4.3) — è pronto, va solo aspettato al momento giusto.
