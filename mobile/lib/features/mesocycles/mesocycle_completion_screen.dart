import 'package:flutter/material.dart';

import '../../core/network/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/error_state.dart';
import '../../core/widgets/skeleton_box.dart';

const _blockTypeLabels = {
  'ACCUMULO': 'Accumulo',
  'TRASMUTAZIONE': 'Trasmutazione',
  'REALIZZAZIONE': 'Realizzazione',
};

/// Schermata "Mesociclo completato" (Sistema Mesocicli): riepilogo del blocco
/// chiuso, poi il feedback che guida il volume del blocco successivo.
class MesocycleCompletionScreen extends StatefulWidget {
  const MesocycleCompletionScreen({super.key, required this.athleteId, required this.mesocycleId});

  final String athleteId;
  final String mesocycleId;

  @override
  State<MesocycleCompletionScreen> createState() => _MesocycleCompletionScreenState();
}

class _MesocycleCompletionScreenState extends State<MesocycleCompletionScreen> {
  final _apiClient = ApiClient();

  bool _isLoading = true;
  String? _error;
  Map<String, dynamic>? _summary;
  bool _showFeedbackForm = false;
  bool _isSubmitting = false;

  int _difficultyPerceived = 5;
  int _energyLevel = 5;
  int _recoveryQuality = 5;
  int _painLevel = 0;
  int _programSatisfaction = 5;
  final _notesController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final summary = await _apiClient.completeMesocycle(widget.athleteId, widget.mesocycleId);
      if (!mounted) return;
      setState(() {
        _summary = summary;
        _isLoading = false;
      });
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.message;
        _isLoading = false;
      });
    }
  }

  Future<void> _submitFeedback() async {
    setState(() => _isSubmitting = true);
    try {
      final result = await _apiClient.submitMesocycleFeedback(
        athleteId: widget.athleteId,
        mesocycleId: widget.mesocycleId,
        difficultyPerceived: _difficultyPerceived,
        energyLevel: _energyLevel,
        recoveryQuality: _recoveryQuality,
        painLevel: _painLevel,
        programSatisfaction: _programSatisfaction,
        notes: _notesController.text,
      );
      if (!mounted) return;

      final explanation =
          (result['adjustment'] as Map<String, dynamic>?)?['explanation'] as String? ?? '';
      await showDialog<void>(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Prossimo mesociclo'),
          content: Text(explanation),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('Ho capito')),
          ],
        ),
      );

      if (!mounted) return;
      Navigator.of(context).pop(true);
    } on ApiException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Mesociclo completato')),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Padding(
        padding: EdgeInsets.all(AppSpacing.lg),
        child: Column(children: [SkeletonBox(height: 120), SizedBox(height: AppSpacing.md), SkeletonBox(height: 200)]),
      );
    }
    if (_error != null) {
      return Center(child: ErrorState(message: _error!, onRetry: _load));
    }

    final summary = _summary!;
    return ListView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      children: [
        _buildSummaryCard(summary),
        const SizedBox(height: AppSpacing.lg),
        if (!_showFeedbackForm)
          ElevatedButton(
            onPressed: () => setState(() => _showFeedbackForm = true),
            child: const Text('Lascia un feedback'),
          )
        else
          _buildFeedbackForm(),
      ],
    );
  }

  Widget _buildSummaryCard(Map<String, dynamic> summary) {
    final blockType = summary['blockType'] as String?;
    final totalSessions = summary['totalSessions'] as int? ?? 0;
    final completedSessions = summary['completedSessions'] as int? ?? 0;
    final adherence = summary['adherencePercentage'];
    final improvements = summary['improvements'] as Map<String, dynamic>?;
    final avgRpe = improvements?['avgSessionRpe'];
    final totalSets = improvements?['totalSetsLogged'];

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              blockType != null ? (_blockTypeLabels[blockType] ?? blockType) : 'Blocco completato',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.navy),
            ),
            const SizedBox(height: AppSpacing.sm),
            Text('Allenamenti completati: $completedSessions / $totalSessions'),
            const SizedBox(height: 4),
            Text('Aderenza al programma: ${adherence != null ? '$adherence%' : 'n/d'}'),
            if (avgRpe != null) ...[
              const SizedBox(height: 4),
              Text('RPE medio del blocco: $avgRpe'),
            ],
            if (totalSets != null) ...[
              const SizedBox(height: 4),
              Text('Volume totale (set pianificati): $totalSets'),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildFeedbackForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Com\'è andato questo blocco?', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.navy)),
        const SizedBox(height: AppSpacing.md),
        _buildSlider('Difficoltà percepita', _difficultyPerceived, 1, 10, (v) => setState(() => _difficultyPerceived = v)),
        _buildSlider('Energia', _energyLevel, 1, 10, (v) => setState(() => _energyLevel = v)),
        _buildSlider('Qualità del recupero', _recoveryQuality, 1, 10, (v) => setState(() => _recoveryQuality = v)),
        _buildSlider('Dolori riportati', _painLevel, 0, 10, (v) => setState(() => _painLevel = v)),
        _buildSlider('Soddisfazione per il programma', _programSatisfaction, 1, 10, (v) => setState(() => _programSatisfaction = v)),
        const SizedBox(height: AppSpacing.sm),
        TextField(
          controller: _notesController,
          decoration: const InputDecoration(labelText: 'Note (opzionale)'),
          maxLines: 2,
        ),
        const SizedBox(height: AppSpacing.lg),
        ElevatedButton(
          onPressed: _isSubmitting ? null : _submitFeedback,
          child: _isSubmitting
              ? const SizedBox(
                  height: 20,
                  width: 20,
                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                )
              : const Text('Invia feedback'),
        ),
      ],
    );
  }

  Widget _buildSlider(String label, int value, int min, int max, ValueChanged<int> onChanged) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('$label: $value/$max'),
          Slider(
            value: value.toDouble(),
            min: min.toDouble(),
            max: max.toDouble(),
            divisions: max - min,
            label: '$value',
            onChanged: (v) => onChanged(v.round()),
          ),
        ],
      ),
    );
  }
}
