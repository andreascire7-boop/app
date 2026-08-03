# Strength & Conditioning Intelligence Platform per Tennis e Padel

### Documento di Progettazione di Prodotto — Analisi di Mercato, Prodotto, PRD, Architettura, Database, UX, Sistema AI, Business Model, Roadmap

Preparato da: CTO · Senior Product Manager · UX/UI Designer · Software Architect · Flutter Expert · Backend Engineer · AI Engineer · Database Architect · Esperto Cybersecurity · QA Engineer · Esperto Tennis/Padel/S&C

---

# FASE 1 — Analisi di Mercato

## 1.1 Dimensione e trend di mercato

| Segmento | Dato | Trend |
|---|---|---|
| Padel — giocatori globali | 19,4M (stima conservativa) → 35M+ (stime estese) | ricerche +49% YoY 2024-2025 |
| Padel — campi | 58.300 globali, →91.000 stimati entro 2028 | +16% YoY |
| Padel — mercato economico | $293M–$1,13B a seconda del perimetro | CAGR 8-13% |
| Tennis | Mercato maturo, base praticanti globale molto ampia | crescita più lenta, community strutturata (federazioni, accademie, circuiti junior) |

**Lettura strategica**: il padel è nella fase esatta in cui, secondo Thiel, conviene entrare — iper-crescita, nessun monopolio di prodotto digitale affermato. Il tennis offre la base utenti matura, i dati storici e le accademie strutturate (canale B2B). Tennis e padel condividono ~70% delle richieste fisiologiche (S&C, potenza, agilità, prevenzione infortuni spalla/caviglia/core): un solo motore AI, un solo dataset, due go-to-market sequenziali.

## 1.2 Competitor landscape

| Categoria | Player | Punti di forza | Limite strutturale |
|---|---|---|---|
| S&C generalisti con AI | Fitbod, FitnessAI, Dr. Muscle, Planfit | Progressione di carico automatica, buon UX consumer | Zero specificità sport: non conoscono calendario gare, biomeccanica del colpo, asimmetrie tipiche |
| S&C per coach professionisti | TrainHeroic, TeamBuildr, CoachRx, JuggernautAI | Periodizzazione seria, libreria esercizi | L'AI assiste la scrittura, non genera/adatta autonomamente; nessun legame con dati match/torneo |
| Injury prevention AI (elite/team sport) | Zone7 (ora Svexa), Kinexon, Catapult | Previsione infortuni validata (~72% accuratezza, -60% infortuni Getafe) | Costruiti per team sport professionistico, prezzo/integrazione enterprise |
| Tennis-specific | Tennis Fitness, Top Tennis Training | Buoni contenuti editoriali | Contenuto statico, zero AI, zero feedback loop |
| Tecnica/video | SwingVision, PlaySight | Ottima analisi tecnica del colpo | Non fanno S&C: nessun ponte tra tecnica e preparazione fisica |
| Padel | Categoria S&C dedicata sostanzialmente assente | — | Whitespace quasi totale |
| Wearable/recovery | Whoop, Oura | Ottimo tracking HRV/sonno/recupero | Dati grezzi senza contestualizzazione sport-specifica |

## 1.3 Punti deboli sistemici del mercato

1. Frammentazione: l'utente serio usa 4-5 strumenti scollegati che non comunicano tra loro.
2. Programmi statici, non reattivi: anche i migliori prodotti restano "il coach scrive, l'atleta esegue".
3. Nessuno integra il calendario competitivo per tapering/deload automatico.
4. Injury prevention è un privilegio elite, chiuso nel mondo pro a costi enterprise.
5. Il padel è trattato come "tennis minore", nessuna logica di carico specifica.
6. UX da "app da palestra", non da preparatore atletico personale.

## 1.4 Opportunità (whitespace)

- Motore decisionale AI sport-specifico che scala l'accesso a decisioni oggi riservate a pochi atleti facoltosi.
- Unificazione dei dati: calendario + carico + recupero + feedback + storico infortuni in un'unica decisione.
- Padel come cavallo di Troia di crescita rapida; tennis come cavallo di Troia di credibilità e monetizzazione B2B.
- Democratizzare l'injury prevention "Zone7-style" a prezzo consumer/prosumer.
- Marketplace B2B2C con accademie e preparatori come canale di distribuzione.

## 1.5 Funzionalità mancanti nel mercato (per impatto)

1. Auto-periodizzazione ancorata al calendario gare.
2. Rilevamento precoce di affaticamento/rischio infortunio a costo consumer.
3. Sostituzione automatica di esercizi con logica clinica dietro.
4. Adattamento in tempo reale del volume/intensità post-sessione.
5. Logiche differenziate tennis vs padel.
6. Canale B2B nativo per accademie/federazioni.
7. Spiegabilità delle decisioni AI.

## 1.6 Strategia di differenziazione

| Dimensione | Valutazione |
|---|---|
| Vantaggi | Moat da dati proprietari che migliora con la scala; posizionamento in nicchia stretta (Thiel: dominare un mercato piccolo prima di espandersi) |
| Svantaggi | Nicchia iniziale piccola in valore assoluto; richiede credibilità clinica/scientifica |
| Rischi | Un big player fitness aggiunge uno "sport mode"; rischio regolatorio/responsabilità legale su raccomandazioni AI legate a infortuni |
| Impatto economico | Alto LTV: un infortunio evitato vale più di anni di abbonamento |
| Complessità di sviluppo | Alta sul motore AI/decisionale, media sul resto dello stack |
| Scalabilità futura | Alta: architettura riusabile per altri sport intermittenti (non ora — dominare prima la nicchia) |

**Decisione strategica adottata**: tennis e padel come un solo mercato tecnico (stesso motore, stesso dataset) con due go-to-market sequenziali — lancio su padel, poi espansione a tennis entro 6-9 mesi.

---

# FASE 2 — Definizione del Prodotto

## 2.1 Vision
Diventare il sistema nervoso della preparazione atletica per gli sport di racchetta: il punto in cui ogni tennista e padelista riceve le stesse decisioni intelligenti che oggi solo un preparatore atletico d'élite può offrire a pochi privilegiati.

## 2.2 Mission
Prevenire l'infortunio prima che accada e massimizzare la prestazione in campo, trasformando calendario gare, carico di allenamento, recupero e feedback soggettivo in un'unica decisione quotidiana — spiegata, non imposta.

## 2.3 Value Proposition

Jobs to be done: *"Voglio arrivare al torneo/partita importante nella condizione migliore possibile, senza infortunarmi, senza dover essere io stesso l'esperto di scienze motorie."*

| Elemento | Contenuto |
|---|---|
| Pain principali | Programmi statici che ignorano il calendario gare; nessuno distingue affaticamento normale da rischio reale; troppi strumenti scollegati; ansia da sovrallenamento/sotto-allenamento |
| Gain principali | Piano che si aggiorna da solo in base alla risposta reale; preparatore atletico sempre disponibile; comprensione del "perché" di ogni scelta |
| Value Proposition | "Il preparatore atletico intelligente che conosce il tuo calendario gare, il tuo corpo e i tuoi limiti — e adatta il piano ogni giorno, non ogni stagione." |

## 2.4 Target utenti

- B2C Core: giocatori competitivi (amatoriali agonisti, junior, master 35+), ≥2 sessioni/settimana, competizioni strutturate.
- B2C Prosumer: semi-professionisti/professionisti di circuito minore senza staff dedicato.
- B2B: accademie, circoli, federazioni giovanili, preparatori freelance.

## 2.5 Personas

| | Sofia, 16 — Junior agonista | Marco, 34 — Amatore competitivo | Elena, 47 — Master 35+ | David, 24 — Semi-pro | Coach Luca — B2B |
|---|---|---|---|---|---|
| Contesto | Tennis 5gg/sett + scuola, tornei giovanili | Padel/tennis 3x/sett, lavoro full-time | Tennis 2-3x/sett, recupero più lento | Circuito ITF/FIP, 10+ tornei/anno | 15-40 atleti tra club e accademia |
| Bisogno S&C | Gestione carico in crescita (LTAD), prevenzione overuse, catena cinetica | Programmi realistici in poco tempo, prevenzione da "weekend warrior" | Mobilità toracica/d'anca, equilibrio cuffia rotatori, GIRD | Periodizzazione a blocchi, tapering, prevenzione overuse gomito/spalla | Vista multi-atleta, alert di gruppo |
| Bisogno nutrizionale | Attenzione a disponibilità energetica (rischio RED-S) | Timing proteico semplice, idratazione tornei estivi | Composizione corporea sostenibile | Nutrizione peri-match multi-giorno | Linee guida generali senza sostituirsi a nutrizionista |
| Cosa la farebbe abbonare | Rassicurazione genitori su prevenzione | Risparmio di tempo/fiducia | Sicurezza "non mi farà male" | Sostituto credibile di uno staff | Efficienza su più atleti, alert automatici |

## 2.6 Modulo Nutrizione — pilastro di prodotto

- Bilancio energetico/composizione corporea: surplus/deficit moderati, mai estremi.
- Proteine: ~1.4–2.0 g/kg/die (fino a ~2.2 in deficit), distribuite su 3-5 pasti.
- Nutrizione peri-match: funzionalità a più alto valore percepito, calcola carboidrati/elettroliti tra match in tornei multi-turno.
- Idratazione: stima da peso pre/post, alert in condizioni di caldo/match lunghi.
- Integratori con evidenza: creatina, caffeina, beta-alanina, bicarbonato, nitrati, con dosaggi indicativi e cautele.
- **Guardrail di sicurezza**: mai piani numerici rigidi individualizzati; segnali di rapporto disfunzionale col cibo o disponibilità energetica cronicamente bassa → redirect a un professionista.

## 2.7 User Journey

1. Scoperta (community padel/tennis, referral coach, canale B2B).
2. Onboarding assessment (livello, sport, storico infortuni, obiettivi, disponibilità, calendario, wearable).
3. Prima generazione del piano, spiegata.
4. Esecuzione quotidiana con feedback (RPE, dolore, sonno).
5. Settimana pre-torneo: tapering automatico + nutrizione peri-match.
6. Durante il torneo: check-in rapidi, raccomandazioni immediate.
7. Post-torneo/infortunio: piano futuro aggiornato.
8. Loop di retention: report periodico "perché stai migliorando".
9. (B2B) Coach view: dashboard aggregata, alert di rischio prioritari.

---

# FASE 3 — PRD (Product Requirements Document)

Scope v1 (padel-first): 12 funzionalità in 8 epic. Priorità P0 = MVP, P1 = fast-follow, P2 = differenziatore avanzato.

## EPIC A — Onboarding & Profilo Atleta

### F1 — Assessment iniziale e profilazione atleta (P0)
**Obiettivo**: raccogliere in un'unica sessione i dati minimi per un primo piano coerente e sicuro.
**Descrizione**: questionario guidato — sport, livello, storico infortuni, disponibilità, obiettivi, limitazioni, età, calendario gare, wearable opzionale.
**User Flow**: sport/livello → storico infortuni → disponibilità → obiettivo → import calendario (opz.) → wearable (opz.) → primo microciclo spiegato.
**Edge Cases**: infortunio attivo → flusso limitazione attiva; minorenne → parametri LTAD-conservativi + disclosure genitori; calendario assente → modalità mantenimento generico; dati incongruenti → segnalazione esplicita.
**Criteri di accettazione**: completamento ≤5 min; nessun piano senza dati minimi obbligatori; infortunio attivo blocca carico standard; riepilogo spiega ≥3 decisioni chiave.

## EPIC B — Motore di Periodizzazione AI

### F2 — Generazione del programma personalizzato (P0)
**Obiettivo**: produrre periodizzazione (macro/meso/microciclo) coerente con livello/obiettivo/sport.
**Descrizione**: scelta del modello (lineare/ondulata/a blocchi) secondo livello e densità gare, applicando sovraccarico progressivo, specificità, residui d'allenamento.
**User Flow**: selezione modello → macrociclo/mesocicli → microciclo corrente con sedute → spiegazione → transizione automatica al blocco successivo.
**Edge Cases**: obiettivi in conflitto → sequenza a blocchi proposta; dati insufficienti → declassamento a ondulata; cambio disponibilità → ricompressione preservando qualità a residuo breve vicino alla gara.
**Criteri di accettazione**: modello coerente con livello/calendario; ogni seduta riporta l'obiettivo del blocco; nessun salto di volume/intensità incoerente salvo scarico pianificato.

### F3 — Integrazione calendario gare e tapering automatico (P0)
**Obiettivo**: ogni evento a calendario innesca automaticamente lo scarico.
**Descrizione**: calcolo a ritroso della finestra di tapering (1-3 settimane), riduzione volume con intensità mantenuta, microciclo competitivo nella settimana dell'evento.
**User Flow**: inserimento evento → ricalcolo a ritroso → taper → gestione giorno-per-giorno in torneo → settimana di transizione post-torneo.
**Edge Cases**: tornei ravvicinati (<10gg) → taper attenuato continuo; preavviso insufficiente → taper parziale dichiarato; torneo cancellato → ripristino guidato.
**Criteri di accettazione**: evento modifica automaticamente 1-3 settimane precedenti; volume ridotto con intensità mantenuta; cancellazione propone ripristino esplicito.

### F4 — Adattamento dinamico da feedback (P0)
**Obiettivo**: ogni feedback modifica il piano futuro, non solo il giorno corrente.
**Descrizione**: check-in post-sessione (RPE, dolore, energia) alimenta un modello di aggiustamento su volume/intensità (fitness − fatica).
**User Flow**: check-in 30s → aggiornamento carico cronico/acuto → attenuazione/sostituzione automatica se necessario → spiegazione visibile.
**Edge Cases**: nessun check-in compilato → piano più conservativo dopo N sessioni; feedback incoerente → bassa affidabilità pesata; dolore acuto isolato ≥9/10 → flusso immediato F6.
**Criteri di accettazione**: check-in ≤30s; RPE alto 3 sessioni consecutive riduce carico successivo; dolore ≥7/10 attiva sostituzione entro la sessione corrente.

## EPIC C — Prevenzione Infortuni

### F5 — Monitoraggio carico e rilevamento rischio (P0)
**Obiettivo**: rilevare segnali precoci di rischio combinando carico, ACWR e fattori soggettivi.
**Descrizione**: ACWR (carico acuto/cronico) + segnali soggettivi + storico infortuni + monotonia settimanale, in un semaforo verde/giallo/rosso sempre spiegato.
**User Flow**: contributo al carico ad ogni sessione → calcolo ACWR/monotonia in background → alert con spiegazione e raccomandazione → visibilità coach.
**Edge Cases**: <4 settimane di storico → affidabilità dichiarata ridotta; spike da torneo pianificato ≠ spike non pianificato; dolore ricorrente di bassa intensità → alert cumulativo.
**Criteri di accettazione**: ACWR aggiornato ad ogni sessione; alert sempre con spiegazione e raccomandazione azionabile; linguaggio mai diagnostico; affidabilità ridotta dichiarata sotto 4 settimane di dati.

### F6 — Sostituzione automatica esercizi per dolore/limitazione (P0)
**Obiettivo**: sostituire in tempo reale esercizi a rischio quando l'atleta segnala dolore.
**Descrizione**: mappatura esercizi per pattern/gruppo muscolare/zona; sostituzione con varianti sicure o prehab mirato.
**User Flow**: segnalazione dolore → classificazione severità → sostituzione immediata (lieve/moderato) o modalità limitazione + rimando professionale (severo) → reintroduzione progressiva a step.
**Edge Cases**: zona non mappata → modalità limitazione generale; utente forza il carico pieno → override loggato; dolore ciclico → pattern accumulato, severità elevata nel tempo.
**Criteri di accettazione**: dolore severo blocca carico standard prima dell'inizio sessione; rientro sempre a step; ogni sostituzione spiegata; nessuna diagnosi clinica mai proposta.

## EPIC D — Recupero

### F7 — Raccomandazioni di recupero (P1)
**Obiettivo**: guidare le decisioni di recupero come farebbe un preparatore.
**Descrizione**: readiness giornaliera da sonno, RPE, ACWR, dolore; priorità dichiarata sonno > nutrizione/idratazione > stress > mezzi attivi.
**User Flow**: readiness al mattino → adattamento proposto pre-sessione se bassa → raccomandazioni contestuali (es. torneo imminente).
**Edge Cases**: nessun wearable → stima solo soggettiva dichiarata; readiness bassa ma torneo non spostabile → adattamento minimo spiegato.
**Criteri di accettazione**: readiness disponibile prima della sessione; readiness bassa produce sempre un adattamento proposto.

## EPIC E — Nutrizione

### F8 — Modulo nutrizione integrato al carico e al calendario (P0)
**Obiettivo**: principi nutrizionali generali contestualizzati, mai sostitutivi di un nutrizionista.
**Descrizione**: bilancio energetico, timing proteico, nutrizione peri-match, idratazione, integratori con evidenza.
**User Flow**: raccolta obiettivi/abitudini in assessment → raccomandazioni generali per carico settimanale → automatismo peri-match su torneo → sezione integratori → guardrail su segnali di rischio.
**Edge Cases**: minorenne → nessuna raccomandazione di perdita massa grassa senza validazione adulto; storico disturbo alimentare → modulo numerico disattivato; tesserati con antidoping → avviso su certificazione integratori; match ravvicinati → priorità reintegro rapido.
**Criteri di accettazione**: nessuna raccomandazione numerica a utenti con segnale di rapporto problematico col cibo, redirect nella stessa sessione; automatismi peri-match senza azione manuale; ogni integratore con dosaggio/evidenza/disclaimer; nessun default di perdita massa grassa per minori.

## EPIC F — Execution & Tracking

### F9 — Sessione guidata di allenamento (P0)
Lista esercizi, timer recupero, log serie con RPE/RIR. Edge cases: interruzione a metà (stato salvato), sostituzione manuale se attrezzatura assente, funzionamento offline con sync. Criteri: usabile offline; nessuna perdita dati su interruzione.

### F10 — Integrazione wearable (P1)
Sync HRV/sonno/HR da Whoop/Oura/Apple/Garmin verso readiness e ACWR. Edge cases: dati parziali → fallback soggettivo; disconnessione reversibile senza perdita storico.

## EPIC G — B2B / Coach

### F11 — Dashboard coach multi-atleta (P1)
Vista aggregata ordinata per rischio, drill-down su singolo atleta, override manuale del piano AI. Edge cases: revoca accesso immediata; paginazione oltre 40 atleti. Criteri: atleti a rischio sempre in cima; revoca verificabile lato coach.

## EPIC H — Engagement & Retention

### F12 — Report progressi e insight periodici (P1)
Report settimanale/mensile con narrazione delle correlazioni decisione→esito. Edge cases: storico insufficiente → dati grezzi con nota esplicita. Criteri: linguaggio mai causale-assoluto; generato anche senza eventi a calendario.

---

# FASE 4 — Architettura Software

## 4.0 Vista d'insieme

Mobile Flutter (iOS+Android) + Web Dashboard Next.js → API Gateway → Core API (NestJS/TypeScript, business logic/CRUD) ↔ AI/Decision Engine (Python/FastAPI: regole + ML + Claude API per spiegazioni) → PostgreSQL + TimescaleDB (dati relazionali + serie temporali) + Redis (cache/code).

**Principio guida**: il motore decisionale non è un prompt a un LLM — è un motore a regole/ML deterministico e auditabile. L'LLM (Claude) entra solo per spiegare le decisioni già prese e per il chat conversazionale.

## 4.1 Frontend

| Soluzione | Vantaggi | Svantaggi | Raccomandazione |
|---|---|---|---|
| Flutter (mobile) | Un codebase iOS+Android, performance native-like, ottimo per UI animate | Ecosistema web più debole | **Scelto** |
| React Native | Ecosistema JS enorme | Performance inferiori su UI animate complesse | Scartata |
| Nativo doppio | Massima performance | Doppio costo/tempo di sviluppo | Scartata |

Web (dashboard coach): **Next.js/React scelto** per SEO/dashboard data-dense; Flutter Web scartato per debolezza SEO.

## 4.2 Backend

**NestJS (Node/TypeScript) core API + Python/FastAPI microservizio AI — scelto.** Alternative scartate: monolite Django (accoppia business logic e ML), Go (ecosistema AI quasi nullo).

## 4.3 Database

**PostgreSQL + TimescaleDB — scelto** (integrità relazionale + serie temporali in un solo motore). Alternative scartate: MongoDB (integrità referenziale debole per dati sensibili), InfluxDB dedicato (secondo DB da operare, complessità ingiustificata a questa scala).

## 4.4 Autenticazione

**Firebase Authentication per il lancio B2C — scelto** (SDK Flutter nativo, costo quasi nullo). Migrazione pianificata ad **Auth0/WorkOS** quando il canale B2B scala (RBAC multi-tenant). Custom JWT scartato (responsabilità di sicurezza ingiustificata in fase iniziale).

## 4.5 Cloud

**Google Cloud Platform — scelto** (sinergia Firebase, Vertex AI, BigQuery). AWS da rivalutare per contratti enterprise; Azure scartato. Mitigazione lock-in: Docker + Terraform.

## 4.6 Storage
Google Cloud Storage + Cloud CDN per media/video esercizi.

## 4.7 Analytics
**PostHog — scelto** (analytics + session replay + feature flag, opzione self-hosted per controllo dati sensibili). Amplitude/Mixpanel da rivalutare a scala. BigQuery come data warehouse/feature store AI.

## 4.8 Pagamenti
**RevenueCat (IAP mobile) + Stripe (fatturazione B2B) — scelto.** Solo Stripe scartato (non conforme a policy Apple per abbonamenti consumer in-app). Paddle da rivalutare per complessità fiscale B2B futura.

## 4.9 AI — architettura a 3 livelli

1. Motore a regole deterministico (periodizzazione a blocchi, ACWR, residui, RTP a step) — spiegabile e auditabile.
2. Modelli ML supervisionati leggeri che affinano le soglie nel tempo (moat dati).
3. LLM (Claude) solo per spiegazione in linguaggio naturale e conversazione — mai generazione diretta di carichi/consigli medici.

Alternative scartate: prompt diretto a un LLM per generare il programma (non auditabile, rischio allucinazioni su dominio con implicazioni fisiche); solo regole senza ML/LLM (non scala l'apprendimento, nessuna spiegazione naturale).

## 4.10 Notifiche
Firebase Cloud Messaging — scelto (gratuito, sinergia GCP). OneSignal rimandato.

## 4.11 Caching
Redis (GCP Memorystore) — scelto per cache, rate limiting, code job (BullMQ).

## 4.12-13 Logging & Monitoraggio
Sentry (error/crash tracking) + Google Cloud Logging/Monitoring + OpenTelemetry (portabilità). Datadog rimandato a scala enterprise.

## 4.14 CI/CD
GitHub Actions (backend/infra) + Codemagic (build/release Flutter, code signing store).

## 4.15 Sicurezza & Compliance
Dati infortuni/biometrici = categoria particolare GDPR art. 9: consenso esplicito granulare, minimizzazione, cifratura at-rest/in-transit, DPIA pre-lancio EU, diritto di cancellazione effettivo (anche dal training ML).

---

# FASE 5 — Progettazione Database

PostgreSQL 15+ con estensione TimescaleDB.

## A — Identity & Access
- **users**: id, email, auth_provider_id, full_name, date_of_birth, role, locale, created_at, deleted_at.
- **organizations**: id, name, type, billing_owner_user_id→users.id, created_at.
- **org_memberships**: id, organization_id→organizations.id, user_id→users.id, org_role — unique(organization_id, user_id).
- **coach_athlete_links**: id, coach_id→users.id, athlete_id→users.id, status, granted_scopes(jsonb), created_at, revoked_at — unique(coach_id, athlete_id).
- **consents**: id, user_id→users.id, consent_type, granted, version, granted_at, revoked_at.

## B — Profilo Atleta
- **athlete_profiles**: user_id (PK/FK), primary_sport, level, dominant_hand, weekly_availability_days, goal_primary, onboarding_completed_at.
- **injury_history**: id, athlete_id→users.id, body_area, description, severity_at_report, status, reported_at, resolved_at.
- **athlete_goals**: id, athlete_id→users.id, goal_type, target_date, notes.
- **guardian_links**: id, athlete_id→users.id, guardian_user_id→users.id, verified_at.

## C — Calendario Gare
- **competitions**: id, athlete_id→users.id, sport, event_date, importance, expected_matches, status, created_at.
- **matches**: id, competition_id→competitions.id, played_at, duration_minutes, result, rpe_reported, notes.

## D — Programmazione
- **macrocycles**: id, athlete_id→users.id, model_type, start_date, end_date, primary_goal.
- **mesocycles**: id, macrocycle_id→macrocycles.id, block_type, start_date, end_date, target_qualities(jsonb).
- **microcycles**: id, mesocycle_id→mesocycles.id, week_start_date, type, planned_volume_index, planned_intensity_index.
- **sessions**: id, microcycle_id→microcycles.id, athlete_id→users.id, scheduled_date, status, session_focus.
- **exercise_library**: id, name, movement_pattern, primary_muscle_groups(jsonb), body_area_risk_tags(jsonb), equipment_required, difficulty_level, media_id→exercise_media.id.
- **session_exercises**: id, session_id→sessions.id, exercise_id→exercise_library.id, order_index, target_sets/reps/load/rpe, substituted_from_id→exercise_library.id.
- **exercise_logs**: id, session_exercise_id→session_exercises.id, set_number, actual_reps/load/rpe, logged_at.

## E — Feedback & Monitoraggio
- **session_feedback**: id, session_id→sessions.id, athlete_id→users.id, session_rpe, energy_level, notes, submitted_at.
- **pain_reports**: id, athlete_id→users.id, body_area, pain_level, context, reported_at.
- **wellness_checkins**: id, athlete_id→users.id, check_date, sleep_quality/hours, stress_level, readiness_score — unique(athlete_id, check_date).
- **wearable_data** (hypertable): time, athlete_id→users.id, metric_type, value, source_device — partizionata su time.
- **load_metrics** (hypertable, rollup giornaliero): day, athlete_id→users.id, acute_load, chronic_load, acwr, monotony_index, computed_at — PK(day, athlete_id).

## F — Motore Rischio / AI
- **risk_assessments**: id, athlete_id→users.id, assessment_date, risk_level, contributing_factors(jsonb), recommendation_text, created_at.
- **ai_decision_log**: id, athlete_id→users.id, decision_type, engine_version, input_snapshot(jsonb), output_decision(jsonb), explanation_text, created_at.
- **exercise_substitution_log**: id, session_exercise_id→session_exercises.id, reason, overridden_by_user.

## G — Nutrizione
- **nutrition_profiles**: user_id (PK/FK), body_comp_goal, dietary_restrictions(jsonb), disordered_eating_flag.
- **nutrition_recommendations**: id, athlete_id→users.id, context, macro_targets(jsonb), generated_at, linked_competition_id→competitions.id.
- **supplement_reference**: id, name, evidence_tier, typical_dosage, cautions.
- **nutrition_flag_events**: id, athlete_id→users.id, trigger_reason, action_taken, created_at.

## H — Pagamenti
- **plans**: id, name, tier, price, billing_period.
- **subscriptions**: id, user_id→users.id, organization_id→organizations.id, plan_id→plans.id, status, provider, external_ref.
- **invoices**: id, organization_id→organizations.id, amount, status, issued_at, stripe_invoice_id.

## I — Notifiche
- **notification_preferences**: user_id (PK), channel, category, enabled.
- **notification_log**: id, user_id→users.id, category, sent_at, opened_at.

## J — Contenuti
- **exercise_media**: id, storage_url, type, duration_seconds.

## K — Audit & Sicurezza
- **audit_log**: id, actor_user_id→users.id, action, target_table, target_id, diff(jsonb), created_at.
- **data_subject_requests**: id, user_id→users.id, request_type, status, requested_at, completed_at.

## 5.1 Indici principali
- wearable_data: `(athlete_id, time DESC)`, hypertable partizionata settimanalmente.
- load_metrics: PK `(day, athlete_id)`.
- sessions: `(athlete_id, scheduled_date)`.
- pain_reports: `(athlete_id, body_area, reported_at DESC)`.
- risk_assessments: `(athlete_id, assessment_date DESC)`.
- coach_athlete_links: indice parziale su `status='active'`.
- ai_decision_log: GIN su input/output jsonb.
- exercise_library: GIN su body_area_risk_tags.
- audit_log: `(target_table, target_id, created_at DESC)`.

## 5.2 Policy di sicurezza

**Row-Level Security** su tutte le tabelle con dato personale: atleta vede solo i propri dati; coach vede un atleta solo se `coach_athlete_links.status='active'`; org admin solo con consenso esplicito attivo.

**Ruoli DB a privilegio minimo**: `role_api_service` (nessun bulk-export diretto su dati sensibili), `role_ai_engine` (read-only su profilo/carico/feedback, write solo su risk_assessments/ai_decision_log/exercise_substitution_log), `role_analytics` (solo viste anonimizzate).

**GDPR**: cifratura applicativa aggiuntiva su injury_history/pain_reports; retention/compressione wearable_data oltre 90gg; diritto alla cancellazione con pipeline di anonimizzazione che esclude l'utente dai retraining ML; audit obbligatorio su coach_athlete_links e override in exercise_substitution_log; guardian_links verificato prerequisito per dati minorenni.

---

# FASE 6 — Progettazione UX

Bottom navigation: **Home · Programma · Nutrizione · Profilo**. Il rischio/infortuni non è un tab fisso ma un banner in Home che apre una schermata dedicata quando rilevante.

## Schermate principali (mobile)

- **S1 Splash**: check sessione automatico, fallback a login.
- **S2 Login/Signup**: social login in evidenza, errori inline, mai popup generico.
- **S3-S5 Assessment**: sport/livello → mappa corpo per storico infortuni → disponibilità/obiettivi/calendario/wearable (skippabile) → transizione spiegata verso il primo piano.
- **S6 Home**: readiness del giorno, card sessione, banner rischio solo se rilevante, skeleton in caricamento, stato vuoto positivo nei giorni di riposo.
- **S7 Programma**: timeline mesocicli, vista settimanale, spiegazione del blocco corrente.
- **S8 Dettaglio sessione**: lista esercizi, "perché" del focus, modifica/salta con motivo.
- **S9 Esecuzione sessione**: un esercizio a schermo, log set, timer recupero, funzionamento offline.
- **S10 Check-in post-sessione**: RPE/dolore/energia in <30s, redirect a S14 se dolore severo.
- **S11-S12 Calendario Gare/Taper**: countdown, grafico volume in discesa, nutrizione peri-match collegata.
- **S13 Centro Rischio**: semaforo, fattori in linguaggio naturale, storico ACWR, link a professionista se rosso.
- **S14 Segnalazione Dolore**: mappa corpo + intensità + contesto, esito immediato non dismissibile per casi severi.
- **S15-S17 Nutrizione**: hub giornaliero, integratori educativi, schermata di redirect professionale come sostituto di sicurezza.
- **S18 Report/Insight**: narrazione degli eventi chiave, mai correlazione presentata come causalità certa.
- **S19 Assistente conversazionale**: chat con "perché?" espandibile, mai consigli medici diretti.
- **S20-S22 Account**: impostazioni/consensi GDPR, paywall trasparente (feature bloccate visibili, non nascoste), collegamento/revoca coach immediata.

## Web Dashboard Coach/B2B
- **S23** Login/setup org. **S24** Lista atleti ordinata per rischio. **S25** Dettaglio atleta con override loggato. **S26** Amministrazione org/fatturazione.

## Pattern trasversali
Skeleton screen invece di spinner a pagina intera; errori mai tecnici grezzi, sempre con azione di recupero; stato vuoto sempre motivante, mai schermo bianco; accessibilità AA, target di tocco ≥44px.

---

# FASE 7 — Sistema AI

## 7.0 Architettura
Pipeline a 3 livelli: motore a regole (deterministico) → ML supervisionato (affina le soglie) → LLM Claude (spiega, non decide). Ogni decisione scritta in `ai_decision_log` con versione delle regole usate.

## 7.1 Creare programmi personalizzati
Needs analysis a 2 fasi (sport + atleta) → scelta modello di periodizzazione per livello/densità gare → mesocicli (2-6 settimane, deload ogni 3-6) → split settimanale (full-body/upper-lower, 2-3 sedute) → struttura seduta (potenza/velocità → forza pesante → accessori/prehab → condizionamento) → selezione esercizi con esclusione automatica delle zone di infortunio attivo → parametri di carico da lookup per obiettivo (forza max ~85%+/1-6rip; ipertrofia 67-85%/6-12rip; potenza 80-90% o 30-60% balistici; resistenza muscolare ≤67%/12+rip).

## 7.2 Modificare il programma da feedback
RPE sistematicamente alto per ≥3 sessioni → riduzione volume 10-20% (una variabile alla volta); wellness composito basso → conversione in seduta di recupero attivo; VBT dove disponibile per soglie di velocità; deload anticipabile dai dati oltre il calendarizzato.

## 7.3 Prevenire infortuni
ACWR confrontato con la variabilità storica individuale (non soglie universali finte — la skill è esplicita: "non è una legge"). Score composito: carico + storico infortuni (predittore più forte) + segnali soggettivi + pattern ricorrenti sotto soglia acuta. Screening iniziale opzionale per personalizzare il prehab da subito.

## 7.4 Adattarsi al calendario gare
Tapering a ritroso (volume -40/-60%, intensità mantenuta, forma graduale/esponenziale) sfruttando i residui d'allenamento (qualità a residuo lungo costruite prima, a residuo breve mantenute vicino alla gara). In-season fitto → modalità mantenimento. Eventi ravvicinati (<10gg) → taper attenuato continuo.

## 7.5 Proporre esercizi sostitutivi
Filtro su tag pattern/zona a rischio → alternative con stesso obiettivo di allenamento + prehab mirato. Segnali severi/persistenti → continuum RTP (protezione → forza e controllo → ricondizionamento generale → sport-specifico → return to play su criteri oggettivi). Uscita dai primi step richiede conferma umana — limite di sicurezza voluto.

## 7.6 Gestire il recupero
Readiness = sonno + RPE/carico recente + dolore + dati wearable opzionali. Priorità comunicata: sonno > nutrizione/idratazione > stress > mezzi passivi. Azione proattiva pre-sessione, non consiglio passivo post-hoc.

## 7.7 Livello di spiegabilità
Output strutturato del motore → prompt vincolato a Claude ("spiega solo con i dati forniti, nessuna raccomandazione clinica aggiuntiva"). Modello economico per spiegazioni quotidiane, modello più capace per conversazione.

## 7.8 Roadmap tecnica di costruzione

| Fase | Contenuto | Perché |
|---|---|---|
| v1 MVP | Motore interamente a regole esplicite | Nessun dato reale ancora su cui addestrare ML |
| v1.5 Validazione | Revisione delle regole con S&C coach/fisioterapisti esterni indipendenti | Riduce il rischio di codifica errata su dominio injury-adjacent |
| v2 ML | Modelli supervisionati che correggono le soglie del motore a regole (fallback esplicabile sempre presente) | Preserva auditabilità, sfrutta il moat dati |
| Continuo | Regression testing su atleti sintetici (personas) ad ogni modifica regole | Evita rotture silenziose su altri profili |

---

# FASE 8 — Modello di Business

## 8.1 Forma di valore primaria
Abbonamento (B2C) + Leasing/Licenza (B2B accademie).

## 8.2 Valutazione delle opzioni

| Modello | Vantaggi | Svantaggi | Rischi | Impatto economico | Complessità | Scalabilità |
|---|---|---|---|---|---|---|
| Freemium | Abbassa barriera d'ingresso, genera dati per il motore | Costo di servire non-convertiti | Soglia free/premium sbagliata erode margine o conversione | Nullo/negativo diretto, alto indiretto | Bassa | Alta |
| Abbonamento Premium B2C | Ricavo ricorrente prevedibile, coerente con LTV alto | Richiede valore dimostrato continuo | Churn se spiegabilità insufficiente | Motore di ricavo primario | Media | Alta |
| B2B (club/coach) | Ticket più alto, coach come leva distributiva | Ciclo di vendita più lungo | Dipendenza da poche relazioni chiave | Alto, margine migliore | Media-Alta | Alta nel medio periodo |
| Licenze Accademie/Federazioni | Contratti pluriennali, credibilità istituzionale | Vendita enterprise lenta | Concentrazione su pochi contratti grandi | Alto per contratto | Alta | Alta dopo case study |
| White Label | Ticket enterprise molto alto, via preferenziale ad acquisizione | Distoglie focus dal core prima di dominare la nicchia | Diluizione brand, dipendenza da pochi clienti | Molto alto, ma rischioso se troppo presto | Molto alta | Alta solo a maturità |
| Marketplace | Motore di crescita virale aggiuntivo | Richiede trust & safety a due lati | Danneggia percezione clinica se mal curato | Incerto, dipende da liquidità marketplace | Molto alta | Alta solo con massa critica |

## 8.3 Sequenza raccomandata
v1: Freemium + Premium B2C. v2 (6-12 mesi): + B2B coach/club. v3 (12-24 mesi): + Licenze Accademie/Federazioni. Roadmap futura (non ora): White Label, Marketplace.

## 8.4 Pricing — metodo del valore percepito

| Tier | Target | Contenuto | Prezzo indicativo |
|---|---|---|---|
| Free | Acquisizione | Piano base statico | €0 |
| Premium | Marco, Elena | Motore AI completo, calendario, nutrizione, injury prevention | ~€9,99-14,99/mese |
| Pro | David | Premium + priorità supporto, export dati coach | ~€19,99-24,99/mese |
| B2B/atleta | Coach Luca | Dashboard multi-atleta, alert aggregati | ~€4-8/atleta/mese |

*Cifre indicative da validare con A/B test reali.*

## 8.5 Motore di crescita
Primario: sticky (retention da valore adattivo crescente). Secondario: quasi-virale via canale coach/accademia.

## 8.6 Opportunità aggiuntiva
Partnership assicurative (forma di valore "Assicurazione") se il prodotto dimostra riduzione misurabile di infortuni — opportunità futura, non milestone attuale.

---

# FASE 9 — Roadmap di Sviluppo

Assunzione di team: 1 CTO/full-stack, 1 backend, 1 Flutter dev, 1 AI/ML engineer, 1 designer part-time, 1 QA part-time.

## Fase 0 — Fondazione tecnica
| Milestone | Contenuto | Durata | Difficoltà | Dipendenze | Priorità |
|---|---|---|---|---|---|
| M0.1 | Setup infra & CI/CD | 2 sett. | Bassa | — | P0 |
| M0.2 | Schema DB v1 | 2 sett. | Media | M0.1 | P0 |
| M0.3 | Design system Flutter | 3 sett. | Media | — | P0 |

## Fase 1 — MVP loop centrale
| Milestone | Contenuto | Durata | Difficoltà | Dipendenze | Priorità |
|---|---|---|---|---|---|
| M1.1 | Auth + Onboarding/Assessment (F1) | 3 sett. | Media | M0.1-3 | P0 |
| M1.2 | Motore periodizzazione v1 (F2) | 6 sett. | Alta — collo di bottiglia critico | M0.2 | P0 |
| M1.3 | Esecuzione sessione (F9) | 3 sett. | Media | M1.2 | P0 |
| M1.4 | Check-in & autoregolazione (F4) | 3 sett. | Media | M1.2, M1.3 | P0 |

## Fase 2 — Prevenzione, calendario, recupero, nutrizione
| Milestone | Contenuto | Durata | Difficoltà | Dipendenze | Priorità |
|---|---|---|---|---|---|
| M2.1 | Calendario gare & tapering (F3) | 3 sett. | Media-Alta | M1.2 | P0 |
| M2.2 | ACWR & rischio infortuni (F5) | 4 sett. | Alta | M1.2, M1.4 | P0 |
| M2.3 | Sostituzione esercizi & RTP (F6) | 4 sett. | Alta | M2.2 | P0 |
| M2.4 | Recupero/readiness (F7) | 2 sett. | Media | M1.4, M2.2 | P1 |
| M2.5 | Nutrizione + guardrail (F8) | 3 sett. | Media | M1.1 | P0 |
| M2.6 | Validazione clinica esterna | 3 sett. | Media | M2.2, M2.3, M2.5 | P0 bloccante |

## Fase 3 — Lancio Beta Padel
| Milestone | Contenuto | Durata | Difficoltà | Dipendenze | Priorità |
|---|---|---|---|---|---|
| M3.1 | Pagamenti | 3 sett. | Media | M2.5 | P0 |
| M3.2 | Notifiche & report base | 2 sett. | Bassa | M1.4 | P1 |
| M3.3 | QA end-to-end & hardening | 3 sett. | Alta | tutte M0-M2 | P0 bloccante |
| M3.4 | Beta chiusa (community padel) | 4 sett. | Media | M3.1-3.3 | P0 |
| M3.5 | Lancio pubblico v1 | 1 sett. | Bassa | M3.4 | P0 |

**Totale stimato fino al lancio pubblico v1: ~9-10 mesi.**

## Fase 4 — Monetizzazione B2B & espansione contenuti
M4.1 Dashboard Coach (5 sett., media-alta) · M4.2 Assistente conversazionale (4 sett., media) · M4.3 Espansione Tennis (5 sett., media, P0) · M4.4 Wearable integration (3 sett., media, P2).

## Fase 5 — Motore ML & scaling enterprise
M5.1 Data flywheel (4 sett., alta) · M5.2 Motore ML v2 (6 sett., molto alta) · M5.3 Case study & licenze Accademie (6 sett., media) · M5.4 Migrazione Auth enterprise (2 sett., media).

## Fase 6 — Roadmap futura (da rivalutare)
White Label, Marketplace, Partnership assicurative, Espansione ad altri sport intermittenti — tutte rimandate a dopo il dominio stabile della nicchia tennis+padel.

## Percorso critico
`Schema DB → Motore periodizzazione → Rischio infortuni/Sostituzione esercizi → Validazione clinica esterna → QA/sicurezza → Lancio`. Le milestone su motore AI e prevenzione infortuni non vanno tagliate per accelerare: sono il vero vantaggio competitivo e la maggiore responsabilità reputazionale/legale del prodotto.
