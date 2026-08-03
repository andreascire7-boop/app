import 'package:flutter/material.dart';

import '../../core/network/api_client.dart';
import '../../core/theme/app_theme.dart';
import 'session_feedback_screen.dart';

/// S9 (docs/product-design FASE 6): one exercise at a time, log sets, move on.
/// Logging failures are non-blocking (best-effort, matches the "offline-friendly"
/// requirement in FASE 3 F9 — a full offline queue is future work, not in this slice).
class SessionExecutionScreen extends StatefulWidget {
  const SessionExecutionScreen({
    super.key,
    required this.athleteId,
    required this.sessionId,
    required this.session,
  });

  final String athleteId;
  final String sessionId;
  final Map<String, dynamic> session;

  @override
  State<SessionExecutionScreen> createState() => _SessionExecutionScreenState();
}

class _LoggedSet {
  _LoggedSet({this.reps, this.load, this.rpe});
  final int? reps;
  final double? load;
  final double? rpe;
}

class _SessionExecutionScreenState extends State<SessionExecutionScreen> {
  final _apiClient = ApiClient();
  int _currentIndex = 0;
  final Map<int, List<_LoggedSet>> _loggedSets = {};

  List<dynamic> get _exercises => widget.session['exercises'] as List<dynamic>;

  bool get _isLastExercise => _currentIndex == _exercises.length - 1;

  Future<void> _recordSet() async {
    final repsController = TextEditingController();
    final loadController = TextEditingController();
    final rpeController = TextEditingController();

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Registra serie'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: repsController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Ripetizioni'),
            ),
            TextField(
              controller: loadController,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              decoration: const InputDecoration(labelText: 'Carico (kg)'),
            ),
            TextField(
              controller: rpeController,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              decoration: const InputDecoration(labelText: 'RPE'),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Annulla')),
          ElevatedButton(onPressed: () => Navigator.pop(context, true), child: const Text('Salva')),
        ],
      ),
    );

    if (confirmed != true) return;

    final loggedSet = _LoggedSet(
      reps: int.tryParse(repsController.text),
      load: double.tryParse(loadController.text),
      rpe: double.tryParse(rpeController.text),
    );

    setState(() {
      _loggedSets.putIfAbsent(_currentIndex, () => []).add(loggedSet);
    });

    final sessionExercise = _exercises[_currentIndex] as Map<String, dynamic>;
    final setNumber = _loggedSets[_currentIndex]!.length;
    try {
      await _apiClient.logExerciseSet(
        athleteId: widget.athleteId,
        sessionId: widget.sessionId,
        sessionExerciseId: sessionExercise['id'] as String,
        setNumber: setNumber,
        actualReps: loggedSet.reps,
        actualLoad: loggedSet.load,
        actualRpe: loggedSet.rpe,
      );
    } on ApiException {
      // Non-blocking: the set stays recorded locally even if the sync call fails.
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Serie salvata solo localmente: sincronizzazione fallita.')),
        );
      }
    }
  }

  void _goToNextExercise() {
    if (_isLastExercise) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (_) => SessionFeedbackScreen(athleteId: widget.athleteId, sessionId: widget.sessionId),
        ),
      );
    } else {
      setState(() => _currentIndex++);
    }
  }

  @override
  Widget build(BuildContext context) {
    final sessionExercise = _exercises[_currentIndex] as Map<String, dynamic>;
    final exercise = sessionExercise['exercise'] as Map<String, dynamic>;
    final targetSets = sessionExercise['targetSets'] as int?;
    final loggedCount = _loggedSets[_currentIndex]?.length ?? 0;

    return Scaffold(
      appBar: AppBar(title: Text('Esercizio ${_currentIndex + 1}/${_exercises.length}')),
      body: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              exercise['name'] as String? ?? '',
              style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.navy),
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              'Obiettivo: ${sessionExercise['targetSets'] ?? '-'} serie × '
              '${sessionExercise['targetReps'] ?? '-'} rip. · RPE ${sessionExercise['targetRpe'] ?? '-'}',
              style: const TextStyle(color: AppColors.grey),
            ),
            const SizedBox(height: AppSpacing.lg),
            Text('Serie registrate: $loggedCount${targetSets != null ? '/$targetSets' : ''}'),
            const SizedBox(height: AppSpacing.sm),
            OutlinedButton.icon(
              onPressed: _recordSet,
              icon: const Icon(Icons.add),
              label: const Text('Registra serie'),
            ),
            const Spacer(),
            ElevatedButton(
              onPressed: _goToNextExercise,
              child: Text(_isLastExercise ? 'Termina sessione' : 'Esercizio successivo'),
            ),
          ],
        ),
      ),
    );
  }
}
