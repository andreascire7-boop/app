import 'package:flutter/material.dart';

import '../../core/network/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/skeleton_box.dart';
import '../onboarding/assessment_draft.dart' show sportLabel, levelLabel;
import '../subscription/paywall_screen.dart';
import 'injury_history_screen.dart';

/// Profilo Atleta Avanzato (S20-S21, docs/product-design FASE 6): dati sport/
/// livello/obiettivo, storico infortuni e abbonamento. Impostazioni account
/// complete non ancora implementate (FASE 9 M3.1).
class ProfileTab extends StatefulWidget {
  const ProfileTab({super.key, required this.athleteId});

  final String athleteId;

  @override
  State<ProfileTab> createState() => _ProfileTabState();
}

class _ProfileTabState extends State<ProfileTab> {
  final _apiClient = ApiClient();
  bool _isLoading = true;
  Map<String, dynamic>? _subscription;
  Map<String, dynamic>? _profile;
  List<dynamic> _injuries = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _isLoading = true);
    final subscription = await _apiClient.getCurrentSubscription(widget.athleteId);
    final profile = await _apiClient.getAthleteProfile(widget.athleteId);
    final injuries = await _apiClient.listInjuries(widget.athleteId);
    if (!mounted) return;
    setState(() {
      _subscription = subscription;
      _profile = profile;
      _injuries = injuries;
      _isLoading = false;
    });
  }

  String _injurySummaryLabel() {
    final hasActive = _injuries.any((i) => (i as Map<String, dynamic>)['status'] == 'ACTIVE' || i['status'] == 'RECOVERING');
    final hasAny = _injuries.isNotEmpty;
    if (hasActive) return 'Infortunio attivo';
    if (hasAny) return 'Infortuni passati';
    return 'Nessun infortunio';
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Padding(
        padding: EdgeInsets.all(AppSpacing.lg),
        child: Column(children: [SkeletonBox(height: 96), SizedBox(height: AppSpacing.sm), SkeletonBox(height: 72)]),
      );
    }

    final planName = (_subscription?['plan'] as Map<String, dynamic>?)?['name'] as String? ?? 'Free';
    final sport = _profile?['primarySport'] as String?;
    final level = _profile?['level'] as String?;
    final goal = _profile?['goalPrimary'] as String?;

    return ListView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      children: [
        if (_profile != null)
          Card(
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.md),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Profilo atleta', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.navy)),
                  const SizedBox(height: AppSpacing.sm),
                  if (sport != null) Text('Sport: ${sportLabel(sport)}'),
                  if (level != null) Text('Livello: ${levelLabel(level)}'),
                  if (goal != null && goal.isNotEmpty) Text('Obiettivo: $goal'),
                ],
              ),
            ),
          ),
        const SizedBox(height: AppSpacing.sm),
        Card(
          child: ListTile(
            leading: const Icon(Icons.healing_outlined, color: AppColors.navy),
            title: const Text('Storico infortuni'),
            subtitle: Text(_injurySummaryLabel()),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              Navigator.of(context)
                  .push(MaterialPageRoute(builder: (_) => InjuryHistoryScreen(athleteId: widget.athleteId)))
                  .then((_) => _load());
            },
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
        Card(
          child: ListTile(
            leading: const Icon(Icons.workspace_premium_outlined, color: AppColors.navy),
            title: Text('Piano attuale: $planName'),
            subtitle: const Text('Tocca per gestire il tuo abbonamento'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              Navigator.of(context)
                  .push(MaterialPageRoute(builder: (_) => PaywallScreen(athleteId: widget.athleteId)))
                  .then((_) => _load());
            },
          ),
        ),
      ],
    );
  }
}
