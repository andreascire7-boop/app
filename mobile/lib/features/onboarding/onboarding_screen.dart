import 'package:flutter/material.dart';

import '../../core/network/api_client.dart';
import '../../core/router/app_router.dart';
import '../../core/session/app_session.dart';
import '../../core/theme/app_theme.dart';
import 'assessment_draft.dart';

/// S3-S5 (docs/product-design FASE 6): sport/level → injury history →
/// availability/goal, completing in the first macrocycle generation (F1 → F2).
class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _pageController = PageController();
  final _draft = AssessmentDraft();
  final _apiClient = ApiClient();

  int _currentPage = 0;
  bool _isSubmitting = false;
  String? _submitError;

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _goToPage(int page) {
    setState(() => _currentPage = page);
    _pageController.animateToPage(
      page,
      duration: const Duration(milliseconds: 250),
      curve: Curves.easeInOut,
    );
  }

  Future<void> _completeOnboarding() async {
    setState(() {
      _isSubmitting = true;
      _submitError = null;
    });
    try {
      final user = await _apiClient.createUser(
        email: 'athlete+${DateTime.now().millisecondsSinceEpoch}@example.com',
        fullName: 'Nuovo Atleta',
      );
      final athleteId = user['id'] as String;
      AppSession.athleteId = athleteId;

      await _apiClient.upsertProfile(
        athleteId: athleteId,
        primarySport: _draft.primarySport!,
        level: _draft.level!,
        weeklyAvailabilityDays: _draft.weeklyAvailabilityDays,
        goalPrimary: _draft.goalPrimary,
      );

      for (final injury in _draft.injuries) {
        await _apiClient.reportInjury(
          athleteId: athleteId,
          bodyArea: injury.bodyArea,
          severityAtReport: injury.severity,
          description: injury.description,
        );
      }

      await _apiClient.generateMacrocycle(athleteId);

      if (!mounted) return;
      Navigator.of(context).pushReplacementNamed(AppRoutes.home);
    } on ApiException catch (e) {
      setState(() => _submitError = e.message);
    } catch (e) {
      setState(() => _submitError = 'Errore imprevisto: impossibile completare il profilo.');
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Profilo (${_currentPage + 1}/3)'),
        automaticallyImplyLeading: false,
      ),
      body: Column(
        children: [
          LinearProgressIndicator(value: (_currentPage + 1) / 3),
          Expanded(
            child: PageView(
              controller: _pageController,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                _SportLevelStep(draft: _draft, onNext: () => _goToPage(1)),
                _InjuryHistoryStep(
                  draft: _draft,
                  onNext: () => _goToPage(2),
                  onBack: () => _goToPage(0),
                ),
                _AvailabilityGoalStep(
                  draft: _draft,
                  isSubmitting: _isSubmitting,
                  errorText: _submitError,
                  onBack: () => _goToPage(1),
                  onSubmit: _completeOnboarding,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SportLevelStep extends StatefulWidget {
  const _SportLevelStep({required this.draft, required this.onNext});

  final AssessmentDraft draft;
  final VoidCallback onNext;

  @override
  State<_SportLevelStep> createState() => _SportLevelStepState();
}

class _SportLevelStepState extends State<_SportLevelStep> {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: ListView(
        children: [
          const Text('Che sport pratichi?',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.navy)),
          const SizedBox(height: AppSpacing.sm),
          Wrap(
            spacing: AppSpacing.sm,
            children: sportOptions.map((sport) {
              return ChoiceChip(
                label: Text(sportLabel(sport)),
                selected: widget.draft.primarySport == sport,
                onSelected: (_) => setState(() => widget.draft.primarySport = sport),
              );
            }).toList(),
          ),
          const SizedBox(height: AppSpacing.lg),
          const Text('Qual è il tuo livello?',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.navy)),
          const SizedBox(height: AppSpacing.sm),
          Wrap(
            spacing: AppSpacing.sm,
            runSpacing: AppSpacing.sm,
            children: levelOptions.map((level) {
              return ChoiceChip(
                label: Text(levelLabel(level)),
                selected: widget.draft.level == level,
                onSelected: (_) => setState(() => widget.draft.level = level),
              );
            }).toList(),
          ),
          const SizedBox(height: AppSpacing.xl),
          ElevatedButton(
            onPressed: widget.draft.canProceedFromSportStep ? widget.onNext : null,
            child: const Text('Avanti'),
          ),
        ],
      ),
    );
  }
}

class _InjuryHistoryStep extends StatefulWidget {
  const _InjuryHistoryStep({required this.draft, required this.onNext, required this.onBack});

  final AssessmentDraft draft;
  final VoidCallback onNext;
  final VoidCallback onBack;

  @override
  State<_InjuryHistoryStep> createState() => _InjuryHistoryStepState();
}

class _InjuryHistoryStepState extends State<_InjuryHistoryStep> {
  String _selectedBodyArea = bodyAreaOptions.first;
  int _severity = 5;

  void _addInjury() {
    setState(() {
      widget.draft.injuries.add(InjuryDraft(bodyArea: _selectedBodyArea, severity: _severity));
    });
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: ListView(
        children: [
          const Text('Storico infortuni',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.navy)),
          const SizedBox(height: AppSpacing.sm),
          const Text(
            'Segnala eventuali infortuni attivi o recenti: il piano li terrà conto fin da subito.',
            style: TextStyle(color: AppColors.grey, fontSize: 13),
          ),
          const SizedBox(height: AppSpacing.md),
          if (widget.draft.injuries.isEmpty)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: AppSpacing.sm),
              child: Text('Nessun infortunio aggiunto.', style: TextStyle(color: AppColors.grey)),
            )
          else
            ...widget.draft.injuries.asMap().entries.map((entry) {
              final injury = entry.value;
              return ListTile(
                contentPadding: EdgeInsets.zero,
                leading: const Icon(Icons.warning_amber_outlined, color: AppColors.warning),
                title: Text('${bodyAreaLabel(injury.bodyArea)} — intensità ${injury.severity}/10'),
                trailing: IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => setState(() => widget.draft.injuries.removeAt(entry.key)),
                ),
              );
            }),
          const Divider(height: AppSpacing.lg),
          DropdownButtonFormField<String>(
            value: _selectedBodyArea,
            decoration: const InputDecoration(labelText: 'Zona'),
            items: bodyAreaOptions
                .map((area) => DropdownMenuItem(value: area, child: Text(bodyAreaLabel(area))))
                .toList(),
            onChanged: (value) => setState(() => _selectedBodyArea = value!),
          ),
          const SizedBox(height: AppSpacing.sm),
          Text('Intensità: $_severity/10'),
          Slider(
            value: _severity.toDouble(),
            min: 0,
            max: 10,
            divisions: 10,
            label: '$_severity',
            onChanged: (value) => setState(() => _severity = value.round()),
          ),
          OutlinedButton.icon(
            onPressed: _addInjury,
            icon: const Icon(Icons.add),
            label: const Text('Aggiungi zona'),
          ),
          const SizedBox(height: AppSpacing.xl),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(onPressed: widget.onBack, child: const Text('Indietro')),
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: ElevatedButton(onPressed: widget.onNext, child: const Text('Avanti')),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _AvailabilityGoalStep extends StatefulWidget {
  const _AvailabilityGoalStep({
    required this.draft,
    required this.isSubmitting,
    required this.errorText,
    required this.onBack,
    required this.onSubmit,
  });

  final AssessmentDraft draft;
  final bool isSubmitting;
  final String? errorText;
  final VoidCallback onBack;
  final VoidCallback onSubmit;

  @override
  State<_AvailabilityGoalStep> createState() => _AvailabilityGoalStepState();
}

class _AvailabilityGoalStepState extends State<_AvailabilityGoalStep> {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: ListView(
        children: [
          const Text('Disponibilità e obiettivo',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.navy)),
          const SizedBox(height: AppSpacing.md),
          Text('Giorni disponibili a settimana: ${widget.draft.weeklyAvailabilityDays}'),
          Slider(
            value: widget.draft.weeklyAvailabilityDays.toDouble(),
            min: 0,
            max: 7,
            divisions: 7,
            label: '${widget.draft.weeklyAvailabilityDays}',
            onChanged: (value) => setState(() => widget.draft.weeklyAvailabilityDays = value.round()),
          ),
          const SizedBox(height: AppSpacing.md),
          TextField(
            decoration: const InputDecoration(labelText: 'Obiettivo principale (facoltativo)'),
            onChanged: (value) => widget.draft.goalPrimary = value,
          ),
          const SizedBox(height: AppSpacing.xl),
          if (widget.errorText != null) ...[
            Text(widget.errorText!, style: const TextStyle(color: AppColors.danger)),
            const SizedBox(height: AppSpacing.md),
          ],
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: widget.isSubmitting ? null : widget.onBack,
                  child: const Text('Indietro'),
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: ElevatedButton(
                  onPressed: widget.isSubmitting ? null : widget.onSubmit,
                  child: widget.isSubmitting
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : const Text('Completa profilo'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
