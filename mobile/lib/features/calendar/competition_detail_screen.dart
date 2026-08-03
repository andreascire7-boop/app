import 'package:flutter/material.dart';

import '../../core/network/api_client.dart';
import '../../core/theme/app_theme.dart';
import 'competitions_screen.dart' show importanceLabel;
import '../onboarding/assessment_draft.dart' show sportLabel;

/// S12 (docs/product-design FASE 6): countdown e stato del taper, con
/// possibilità di annullare il torneo (ripristina il piano pre-taper lato backend).
class CompetitionDetailScreen extends StatefulWidget {
  const CompetitionDetailScreen({super.key, required this.athleteId, required this.competition});

  final String athleteId;
  final Map<String, dynamic> competition;

  @override
  State<CompetitionDetailScreen> createState() => _CompetitionDetailScreenState();
}

class _CompetitionDetailScreenState extends State<CompetitionDetailScreen> {
  final _apiClient = ApiClient();
  bool _isCancelling = false;
  String? _error;

  Future<void> _confirmCancel() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Annullare il torneo?'),
        content: const Text('Il piano di allenamento verrà ripristinato ai valori precedenti al taper.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('No')),
          ElevatedButton(onPressed: () => Navigator.pop(context, true), child: const Text('Sì, annulla')),
        ],
      ),
    );
    if (confirmed != true) return;

    setState(() {
      _isCancelling = true;
      _error = null;
    });
    try {
      await _apiClient.cancelCompetition(widget.athleteId, widget.competition['id'] as String);
      if (!mounted) return;
      Navigator.of(context).pop();
    } on ApiException catch (e) {
      setState(() {
        _isCancelling = false;
        _error = e.message;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final eventDate = DateTime.parse(widget.competition['eventDate'] as String);
    final daysLeft = eventDate.difference(DateTime.now()).inDays;
    final status = widget.competition['status'] as String;

    return Scaffold(
      appBar: AppBar(title: Text(sportLabel(widget.competition['sport'] as String))),
      body: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              daysLeft >= 0 ? 'Tra $daysLeft giorni' : 'Evento passato',
              style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: AppColors.navy),
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              '${importanceLabel(widget.competition['importance'] as String)} · Stato: $status',
              style: const TextStyle(color: AppColors.grey),
            ),
            const SizedBox(height: AppSpacing.lg),
            const Text(
              'Il piano di allenamento nella finestra di preparazione a questo torneo viene ridotto '
              'automaticamente in volume, mantenendo l\'intensità (tapering).',
              style: TextStyle(color: AppColors.grey),
            ),
            const Spacer(),
            if (_error != null) ...[
              Text(_error!, style: const TextStyle(color: AppColors.danger)),
              const SizedBox(height: AppSpacing.sm),
            ],
            if (status != 'CANCELLED')
              OutlinedButton(
                onPressed: _isCancelling ? null : _confirmCancel,
                child: _isCancelling
                    ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))
                    : const Text('Annulla torneo'),
              ),
          ],
        ),
      ),
    );
  }
}
