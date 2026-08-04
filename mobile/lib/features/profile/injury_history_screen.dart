import 'package:flutter/material.dart';

import '../../core/network/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/empty_state.dart';
import '../../core/widgets/error_state.dart';
import '../../core/widgets/skeleton_box.dart';
import '../onboarding/assessment_draft.dart'
    show bodyAreaOptions, bodyAreaLabel, injuryStatusOptions, injuryStatusLabel;

Color _statusColor(String status) => switch (status) {
      'ACTIVE' => AppColors.danger,
      'RECOVERING' => AppColors.warning,
      'RESOLVED' => AppColors.success,
      _ => AppColors.grey,
    };

/// Storico infortuni completo (Profilo Atleta Avanzato): zona, gravità e stato
/// (presente/recupero/risolto) guidano scelta esercizi, volume e prehab lato AI
/// engine — vedi backend AthleteProfileService + ai-engine periodization.py.
class InjuryHistoryScreen extends StatefulWidget {
  const InjuryHistoryScreen({super.key, required this.athleteId});

  final String athleteId;

  @override
  State<InjuryHistoryScreen> createState() => _InjuryHistoryScreenState();
}

class _InjuryHistoryScreenState extends State<InjuryHistoryScreen> {
  final _apiClient = ApiClient();
  bool _isLoading = true;
  String? _error;
  List<dynamic> _injuries = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final injuries = await _apiClient.listInjuries(widget.athleteId);
      if (!mounted) return;
      setState(() {
        _injuries = injuries;
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

  Future<void> _openAddDialog() async {
    String bodyArea = bodyAreaOptions.first;
    int severity = 5;
    final descriptionController = TextEditingController();
    bool isSubmitting = false;
    String? dialogError;

    await showDialog<void>(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (dialogContext, setDialogState) {
          return AlertDialog(
            title: const Text('Nuovo infortunio'),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                DropdownButtonFormField<String>(
                  value: bodyArea,
                  decoration: const InputDecoration(labelText: 'Zona del corpo'),
                  items: bodyAreaOptions
                      .map((a) => DropdownMenuItem(value: a, child: Text(bodyAreaLabel(a))))
                      .toList(),
                  onChanged: (value) => setDialogState(() => bodyArea = value!),
                ),
                const SizedBox(height: AppSpacing.sm),
                Text('Gravità percepita: $severity/10'),
                Slider(
                  value: severity.toDouble(),
                  min: 0,
                  max: 10,
                  divisions: 10,
                  label: '$severity',
                  onChanged: (value) => setDialogState(() => severity = value.round()),
                ),
                const SizedBox(height: AppSpacing.sm),
                TextField(
                  controller: descriptionController,
                  decoration: const InputDecoration(labelText: 'Descrizione (opzionale)'),
                  maxLines: 2,
                ),
                if (dialogError != null) ...[
                  const SizedBox(height: AppSpacing.sm),
                  Text(dialogError!, style: const TextStyle(color: AppColors.danger)),
                ],
              ],
            ),
            actions: [
              TextButton(onPressed: () => Navigator.pop(dialogContext), child: const Text('Annulla')),
              ElevatedButton(
                onPressed: isSubmitting
                    ? null
                    : () async {
                        setDialogState(() => isSubmitting = true);
                        try {
                          await _apiClient.reportInjury(
                            athleteId: widget.athleteId,
                            bodyArea: bodyArea,
                            severityAtReport: severity,
                            description: descriptionController.text,
                          );
                          if (dialogContext.mounted) Navigator.pop(dialogContext);
                          await _load();
                        } on ApiException catch (e) {
                          setDialogState(() {
                            isSubmitting = false;
                            dialogError = e.message;
                          });
                        }
                      },
                child: const Text('Salva'),
              ),
            ],
          );
        },
      ),
    );
  }

  Future<void> _openEditDialog(Map<String, dynamic> injury) async {
    String status = injury['status'] as String? ?? 'ACTIVE';
    int severity = (injury['severityAtReport'] as num?)?.round() ?? 5;
    bool isSubmitting = false;
    String? dialogError;

    await showDialog<void>(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (dialogContext, setDialogState) {
          return AlertDialog(
            title: Text(bodyAreaLabel(injury['bodyArea'] as String)),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                DropdownButtonFormField<String>(
                  value: status,
                  decoration: const InputDecoration(labelText: 'Stato'),
                  items: injuryStatusOptions
                      .map((s) => DropdownMenuItem(value: s, child: Text(injuryStatusLabel(s))))
                      .toList(),
                  onChanged: (value) => setDialogState(() => status = value!),
                ),
                const SizedBox(height: AppSpacing.sm),
                Text('Gravità percepita: $severity/10'),
                Slider(
                  value: severity.toDouble(),
                  min: 0,
                  max: 10,
                  divisions: 10,
                  label: '$severity',
                  onChanged: (value) => setDialogState(() => severity = value.round()),
                ),
                if (dialogError != null) ...[
                  const SizedBox(height: AppSpacing.sm),
                  Text(dialogError!, style: const TextStyle(color: AppColors.danger)),
                ],
              ],
            ),
            actions: [
              TextButton(onPressed: () => Navigator.pop(dialogContext), child: const Text('Annulla')),
              ElevatedButton(
                onPressed: isSubmitting
                    ? null
                    : () async {
                        setDialogState(() => isSubmitting = true);
                        try {
                          await _apiClient.updateInjury(
                            athleteId: widget.athleteId,
                            injuryId: injury['id'] as String,
                            status: status,
                            severityAtReport: severity,
                          );
                          if (dialogContext.mounted) Navigator.pop(dialogContext);
                          await _load();
                        } on ApiException catch (e) {
                          setDialogState(() {
                            isSubmitting = false;
                            dialogError = e.message;
                          });
                        }
                      },
                child: const Text('Aggiorna'),
              ),
            ],
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Storico infortuni')),
      body: _buildBody(),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openAddDialog,
        icon: const Icon(Icons.add),
        label: const Text('Aggiungi infortunio'),
      ),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Padding(
        padding: EdgeInsets.all(AppSpacing.lg),
        child: Column(children: [SkeletonBox(height: 72), SizedBox(height: AppSpacing.sm), SkeletonBox(height: 72)]),
      );
    }
    if (_error != null) {
      return Center(child: ErrorState(message: _error!, onRetry: _load));
    }
    if (_injuries.isEmpty) {
      return const Center(
        child: EmptyState(
          icon: Icons.healing_outlined,
          title: 'Nessun infortunio registrato',
          message: 'Il tuo storico infortuni aiuta l\'AI a scegliere esercizi e volume più sicuri per te.',
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(AppSpacing.md),
      itemCount: _injuries.length,
      itemBuilder: (context, index) {
        final injury = _injuries[index] as Map<String, dynamic>;
        final status = injury['status'] as String? ?? 'ACTIVE';
        final reportedAt = (injury['reportedAt'] as String?)?.substring(0, 10) ?? '';
        final description = injury['description'] as String?;

        return Card(
          margin: const EdgeInsets.only(bottom: AppSpacing.sm),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: _statusColor(status).withOpacity(0.15),
              child: Icon(Icons.healing_outlined, color: _statusColor(status)),
            ),
            title: Text(bodyAreaLabel(injury['bodyArea'] as String)),
            subtitle: Text(
              'Gravità ${injury['severityAtReport']}/10 · $reportedAt'
              '${description != null && description.isNotEmpty ? '\n$description' : ''}',
            ),
            isThreeLine: description != null && description.isNotEmpty,
            trailing: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: _statusColor(status).withOpacity(0.12),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                injuryStatusLabel(status),
                style: TextStyle(color: _statusColor(status), fontSize: 12, fontWeight: FontWeight.bold),
              ),
            ),
            onTap: () => _openEditDialog(injury),
          ),
        );
      },
    );
  }
}
