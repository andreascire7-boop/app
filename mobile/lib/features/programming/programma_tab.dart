import 'package:flutter/material.dart';

import '../../core/network/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/empty_state.dart';
import '../../core/widgets/error_state.dart';
import '../../core/widgets/skeleton_box.dart';
import '../session/session_detail_screen.dart';

const _blockTypeLabels = {
  'ACCUMULO': 'Accumulo',
  'TRASMUTAZIONE': 'Trasmutazione',
  'REALIZZAZIONE': 'Realizzazione',
};

const _qualityLabels = {
  'potenza_rotazionale': 'Potenza rotazionale',
  'forza_potenza_multiarticolare': 'Forza/potenza multiarticolare',
  'velocita_agilita_brevi_distanze': 'Velocità e agilità',
  'condizionamento_intervallato_sport_specifico': 'Condizionamento specifico',
  'prehab_spalla_gomito_core': 'Prehab spalla/gomito/core',
};

const _blockColors = {
  'ACCUMULO': AppColors.accent,
  'TRASMUTAZIONE': AppColors.warning,
  'REALIZZAZIONE': AppColors.danger,
};

/// S7 (docs/product-design FASE 6): timeline dei mesocicli (blocco corrente
/// spiegato al tocco) + vista delle sedute della settimana corrente.
class ProgrammaTab extends StatefulWidget {
  const ProgrammaTab({super.key, required this.athleteId});

  final String athleteId;

  @override
  State<ProgrammaTab> createState() => _ProgrammaTabState();
}

class _ProgrammaTabState extends State<ProgrammaTab> {
  final _apiClient = ApiClient();
  bool _isLoading = true;
  String? _error;
  Map<String, dynamic>? _macrocycle;

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
      final macrocycle = await _apiClient.getCurrentMacrocycle(widget.athleteId);
      if (!mounted) return;
      setState(() {
        _macrocycle = macrocycle;
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

  void _showMesocycleDetail(Map<String, dynamic> mesocycle) {
    final qualities = (mesocycle['targetQualities'] as List<dynamic>).cast<String>();
    showModalBottomSheet<void>(
      context: context,
      builder: (context) => Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              mesocycle['blockType'] != null
                  ? (_blockTypeLabels[mesocycle['blockType']] ?? mesocycle['blockType'])
                  : 'Blocco',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.navy),
            ),
            const SizedBox(height: AppSpacing.sm),
            const Text('Qualità allenate in questo blocco:', style: TextStyle(color: AppColors.grey)),
            const SizedBox(height: AppSpacing.sm),
            ...qualities.map((q) => Text('• ${_qualityLabels[q] ?? q}')),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Padding(
        padding: EdgeInsets.all(AppSpacing.lg),
        child: Column(children: [SkeletonBox(height: 100), SizedBox(height: AppSpacing.md), SkeletonBox(height: 200)]),
      );
    }
    if (_error != null) {
      return Center(child: ErrorState(message: _error!, onRetry: _load));
    }
    if (_macrocycle == null) {
      return const Center(
        child: EmptyState(
          icon: Icons.timeline_outlined,
          title: 'Nessun piano ancora disponibile',
          message: 'Il tuo macrociclo verrà generato al completamento dell\'onboarding.',
        ),
      );
    }

    final mesocycles = (_macrocycle!['mesocycles'] as List<dynamic>).cast<Map<String, dynamic>>();
    final allSessions = <Map<String, dynamic>>[];
    for (final meso in mesocycles) {
      for (final micro in (meso['microcycles'] as List<dynamic>).cast<Map<String, dynamic>>()) {
        allSessions.addAll((micro['sessions'] as List<dynamic>).cast<Map<String, dynamic>>());
      }
    }
    allSessions.sort((a, b) => (a['scheduledDate'] as String).compareTo(b['scheduledDate'] as String));

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        children: [
          Text(
            'Modello: ${_macrocycle!['modelType']}',
            style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.navy),
          ),
          const SizedBox(height: AppSpacing.sm),
          SizedBox(
            height: 88,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: mesocycles.length,
              separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.sm),
              itemBuilder: (context, index) {
                final meso = mesocycles[index];
                final blockType = meso['blockType'] as String?;
                final color = blockType != null ? (_blockColors[blockType] ?? AppColors.grey) : AppColors.grey;
                return GestureDetector(
                  onTap: () => _showMesocycleDetail(meso),
                  child: Container(
                    width: 160,
                    padding: const EdgeInsets.all(AppSpacing.sm),
                    decoration: BoxDecoration(
                      color: color.withOpacity(0.12),
                      border: Border.all(color: color),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          blockType != null ? (_blockTypeLabels[blockType] ?? blockType) : 'Blocco unico',
                          style: TextStyle(fontWeight: FontWeight.bold, color: color),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${(meso['startDate'] as String).substring(0, 10)} → '
                          '${(meso['endDate'] as String).substring(0, 10)}',
                          style: const TextStyle(fontSize: 11, color: AppColors.grey),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          const Text('Sedute pianificate', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.navy)),
          const SizedBox(height: AppSpacing.sm),
          if (allSessions.isEmpty)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: AppSpacing.md),
              child: Text('Nessuna seduta generata per questo blocco.', style: TextStyle(color: AppColors.grey)),
            )
          else
            ...allSessions.map((session) {
              return Card(
                margin: const EdgeInsets.only(bottom: AppSpacing.sm),
                child: ListTile(
                  title: Text(session['sessionFocus'] as String? ?? 'Allenamento'),
                  subtitle: Text(
                    '${(session['scheduledDate'] as String).substring(0, 10)} · ${session['status']}',
                  ),
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => SessionDetailScreen(
                          athleteId: widget.athleteId,
                          sessionId: session['id'] as String,
                        ),
                      ),
                    );
                  },
                ),
              );
            }),
        ],
      ),
    );
  }
}
