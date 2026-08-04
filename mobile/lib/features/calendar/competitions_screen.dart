import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';

import '../../core/network/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/empty_state.dart';
import '../../core/widgets/error_state.dart';
import '../../core/widgets/skeleton_box.dart';
import '../onboarding/assessment_draft.dart' show sportOptions, sportLabel;
import 'competition_detail_screen.dart';

const importanceOptions = ['LOCALE', 'REGIONALE', 'NAZIONALE'];

String importanceLabel(String value) => switch (value) {
      'LOCALE' => 'Locale',
      'REGIONALE' => 'Regionale',
      'NAZIONALE' => 'Nazionale',
      _ => value,
    };

/// S11 (docs/product-design FASE 6): lista tornei, stato vuoto che spiega il
/// valore dell'azione mancante, "+ Aggiungi torneo" attiva la preparazione
/// automatica (F3) lato backend.
class CompetitionsScreen extends StatefulWidget {
  const CompetitionsScreen({super.key, required this.athleteId});

  final String athleteId;

  @override
  State<CompetitionsScreen> createState() => _CompetitionsScreenState();
}

class _CompetitionsScreenState extends State<CompetitionsScreen> {
  final _apiClient = ApiClient();
  bool _isLoading = true;
  String? _error;
  List<dynamic> _competitions = [];

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
      final competitions = await _apiClient.listCompetitions(widget.athleteId);
      if (!mounted) return;
      setState(() {
        _competitions = competitions;
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
    String sport = sportOptions.first;
    String importance = importanceOptions.first;
    DateTime? eventDate;
    bool isSubmitting = false;
    String? dialogError;

    await showDialog<void>(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (dialogContext, setDialogState) {
          return AlertDialog(
            title: const Text('Nuovo torneo'),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                DropdownButtonFormField<String>(
                  value: sport,
                  decoration: const InputDecoration(labelText: 'Sport'),
                  items: sportOptions
                      .map((s) => DropdownMenuItem(value: s, child: Text(sportLabel(s))))
                      .toList(),
                  onChanged: (value) => setDialogState(() => sport = value!),
                ),
                const SizedBox(height: AppSpacing.sm),
                DropdownButtonFormField<String>(
                  value: importance,
                  decoration: const InputDecoration(labelText: 'Importanza'),
                  items: importanceOptions
                      .map((i) => DropdownMenuItem(value: i, child: Text(importanceLabel(i))))
                      .toList(),
                  onChanged: (value) => setDialogState(() => importance = value!),
                ),
                const SizedBox(height: AppSpacing.sm),
                OutlinedButton(
                  onPressed: () async {
                    final picked = await showDatePicker(
                      context: dialogContext,
                      initialDate: DateTime.now().add(const Duration(days: 14)),
                      firstDate: DateTime.now(),
                      lastDate: DateTime.now().add(const Duration(days: 365)),
                    );
                    if (picked != null) setDialogState(() => eventDate = picked);
                  },
                  child: Text(
                    eventDate == null
                        ? 'Seleziona data evento'
                        : '${eventDate!.year}-${eventDate!.month.toString().padLeft(2, '0')}-${eventDate!.day.toString().padLeft(2, '0')}',
                  ),
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
                        if (eventDate == null) {
                          setDialogState(() => dialogError = 'Seleziona una data.');
                          return;
                        }
                        setDialogState(() => isSubmitting = true);
                        try {
                          await _apiClient.createCompetition(
                            athleteId: widget.athleteId,
                            sport: sport,
                            eventDate: eventDate!.toUtc().toIso8601String(),
                            importance: importance,
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
                child: const Text('Crea'),
              ),
            ],
          );
        },
      ),
    );
  }

  // Import calendario (PDF/Excel/CSV): il backend estrae nome torneo, data,
  // importanza e partite previste per ogni riga trovata (F3, Calendario competitivo).
  Future<void> _importFromFile() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'xlsx', 'xls', 'csv'],
      withData: true,
    );
    final picked = result?.files.single;
    final bytes = picked?.bytes;
    if (picked == null || bytes == null) return;

    setState(() => _isLoading = true);
    try {
      final response = await _apiClient.importCompetitionsFromFile(
        athleteId: widget.athleteId,
        fileBytes: bytes,
        fileName: picked.name,
      );
      final extractedCount = response['extractedCount'] as int? ?? 0;
      await _load();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('$extractedCount tornei importati da ${picked.name}.')),
      );
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Calendario gare'),
        actions: [
          IconButton(
            onPressed: _importFromFile,
            icon: const Icon(Icons.upload_file_outlined),
            tooltip: 'Importa da PDF/Excel/CSV',
          ),
        ],
      ),
      body: _buildBody(),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openAddDialog,
        icon: const Icon(Icons.add),
        label: const Text('Aggiungi torneo'),
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
    if (_competitions.isEmpty) {
      return const Center(
        child: EmptyState(
          icon: Icons.emoji_events_outlined,
          title: 'Nessun torneo in calendario',
          message: 'Aggiungi il tuo prossimo torneo per attivare la preparazione automatica: '
              'il piano si adatterà da solo con lo scarico pre-gara.',
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(AppSpacing.md),
      itemCount: _competitions.length,
      itemBuilder: (context, index) {
        final competition = _competitions[index] as Map<String, dynamic>;
        final eventDate = (competition['eventDate'] as String).substring(0, 10);
        final status = competition['status'] as String;
        return Card(
          margin: const EdgeInsets.only(bottom: AppSpacing.sm),
          child: ListTile(
            leading: Icon(
              status == 'CANCELLED' ? Icons.cancel_outlined : Icons.emoji_events_outlined,
              color: status == 'CANCELLED' ? AppColors.grey : AppColors.accent,
            ),
            title: Text('${sportLabel(competition['sport'] as String)} · $eventDate'),
            subtitle: Text('${importanceLabel(competition['importance'] as String)} · $status'),
            onTap: () {
              Navigator.of(context)
                  .push(
                    MaterialPageRoute(
                      builder: (_) => CompetitionDetailScreen(
                        athleteId: widget.athleteId,
                        competition: competition,
                      ),
                    ),
                  )
                  .then((_) => _load());
            },
          ),
        );
      },
    );
  }
}
