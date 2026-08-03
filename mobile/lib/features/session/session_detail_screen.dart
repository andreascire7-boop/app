import 'package:flutter/material.dart';

import '../../core/network/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/error_state.dart';
import '../../core/widgets/skeleton_box.dart';
import 'session_execution_screen.dart';

/// S8 (docs/product-design FASE 6): pre-execution overview of a session —
/// exercise list with target sets/reps/RPE and the "perché" of the focus.
class SessionDetailScreen extends StatefulWidget {
  const SessionDetailScreen({super.key, required this.athleteId, required this.sessionId});

  final String athleteId;
  final String sessionId;

  @override
  State<SessionDetailScreen> createState() => _SessionDetailScreenState();
}

class _SessionDetailScreenState extends State<SessionDetailScreen> {
  final _apiClient = ApiClient();
  Map<String, dynamic>? _session;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _error = null);
    try {
      final session = await _apiClient.getSession(widget.athleteId, widget.sessionId);
      if (!mounted) return;
      setState(() => _session = session);
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() => _error = e.message);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(_session?['sessionFocus'] as String? ?? 'Sessione')),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_error != null) {
      return Center(child: ErrorState(message: _error!, onRetry: _load));
    }
    if (_session == null) {
      return const Padding(
        padding: EdgeInsets.all(AppSpacing.lg),
        child: Column(
          children: [
            SkeletonBox(height: 72),
            SizedBox(height: AppSpacing.sm),
            SkeletonBox(height: 72),
            SizedBox(height: AppSpacing.sm),
            SkeletonBox(height: 72),
          ],
        ),
      );
    }

    final exercises = (_session!['exercises'] as List<dynamic>);

    return Column(
      children: [
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.all(AppSpacing.md),
            itemCount: exercises.length,
            itemBuilder: (context, index) {
              final sessionExercise = exercises[index] as Map<String, dynamic>;
              final exercise = sessionExercise['exercise'] as Map<String, dynamic>;
              final sets = sessionExercise['targetSets'];
              final reps = sessionExercise['targetReps'];
              final rpe = sessionExercise['targetRpe'];
              final prescription = [
                if (sets != null) '$sets serie',
                if (reps != null) '$reps rip.',
                if (rpe != null) 'RPE $rpe',
              ].join(' · ');

              return Card(
                margin: const EdgeInsets.only(bottom: AppSpacing.sm),
                child: ListTile(
                  title: Text(exercise['name'] as String? ?? ''),
                  subtitle: Text(prescription.isEmpty ? 'Carico libero' : prescription),
                ),
              );
            },
          ),
        ),
        Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: ElevatedButton(
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => SessionExecutionScreen(
                    athleteId: widget.athleteId,
                    sessionId: widget.sessionId,
                    session: _session!,
                  ),
                ),
              );
            },
            child: const Text('Inizia sessione'),
          ),
        ),
      ],
    );
  }
}
