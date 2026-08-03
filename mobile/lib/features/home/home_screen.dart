import 'package:flutter/material.dart';

import '../../core/network/api_client.dart';
import '../../core/session/app_session.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/empty_state.dart';
import '../../core/widgets/error_state.dart';
import '../../core/widgets/skeleton_box.dart';
import '../calendar/competitions_screen.dart';
import '../nutrition/nutrition_hub_screen.dart';
import '../risk/risk_center_screen.dart';
import '../session/session_detail_screen.dart';

/// S6 (docs/product-design FASE 6): bottom nav Home · Programma · Nutrizione ·
/// Profilo. Home shows a loading skeleton, then either today's session or a
/// positive empty state on rest days — never a blank screen. Calendario gare e
/// Centro rischio si raggiungono da qui (FASE 6: "banner/da Home"), non da tab
/// dedicati.
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    final athleteId = AppSession.athleteId;

    final tabs = [
      const _HomeTab(),
      const _PlaceholderTab(
        title: 'Programma',
        subtitle: 'Timeline macro/meso/microciclo — in arrivo (milestone M1.2, FASE 9).',
      ),
      athleteId != null
          ? NutritionHubScreen(athleteId: athleteId)
          : const _PlaceholderTab(
              title: 'Nutrizione',
              subtitle: 'Completa prima l\'onboarding per vedere le tue linee guida.',
            ),
      const _PlaceholderTab(
        title: 'Profilo',
        subtitle: 'Impostazioni account e abbonamento — in arrivo (milestone M3.1, FASE 9).',
      ),
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('S&C Intelligence'),
        actions: athleteId == null
            ? null
            : [
                IconButton(
                  icon: const Icon(Icons.calendar_month_outlined),
                  tooltip: 'Calendario gare',
                  onPressed: () => Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => CompetitionsScreen(athleteId: athleteId)),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.health_and_safety_outlined),
                  tooltip: 'Centro rischio',
                  onPressed: () => Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => RiskCenterScreen(athleteId: athleteId)),
                  ),
                ),
              ],
      ),
      body: IndexedStack(index: _selectedIndex, children: tabs),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) => setState(() => _selectedIndex = index),
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home_outlined), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.fitness_center_outlined), label: 'Programma'),
          BottomNavigationBarItem(icon: Icon(Icons.restaurant_outlined), label: 'Nutrizione'),
          BottomNavigationBarItem(icon: Icon(Icons.person_outline), label: 'Profilo'),
        ],
      ),
    );
  }
}

class _HomeTab extends StatefulWidget {
  const _HomeTab();

  @override
  State<_HomeTab> createState() => _HomeTabState();
}

class _HomeTabState extends State<_HomeTab> {
  final _apiClient = ApiClient();
  bool _isLoading = true;
  String? _error;
  Map<String, dynamic>? _nextSession;

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

    final athleteId = AppSession.athleteId;
    if (athleteId == null) {
      // Shouldn't happen once onboarding always runs first, but never crash on it.
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _nextSession = null;
      });
      return;
    }

    try {
      final sessions = await _apiClient.listSessions(athleteId);
      final upcoming = sessions
          .cast<Map<String, dynamic>>()
          .where((s) => s['status'] == 'PLANNED' || s['status'] == 'MODIFIED')
          .toList()
        ..sort((a, b) => (a['scheduledDate'] as String).compareTo(b['scheduledDate'] as String));

      if (!mounted) return;
      setState(() {
        _nextSession = upcoming.isEmpty ? null : upcoming.first;
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

  @override
  Widget build(BuildContext context) {
    final athleteId = AppSession.athleteId;

    return ListView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      children: [
        if (athleteId != null) _ReadinessCard(athleteId: athleteId),
        const SizedBox(height: AppSpacing.md),
        _buildSessionSection(),
      ],
    );
  }

  Widget _buildSessionSection() {
    if (_isLoading) {
      return const Column(
        children: [SkeletonBox(height: 140)],
      );
    }
    if (_error != null) {
      return ErrorState(message: _error!, onRetry: _load);
    }
    if (_nextSession == null) {
      return const EmptyState(
        icon: Icons.self_improvement,
        title: 'Nessuna sessione pianificata',
        message: 'Il tuo prossimo allenamento non è ancora stato generato, '
            'oppure oggi è un giorno di riposo. Priorità al recupero: sonno prima di tutto.',
      );
    }

    final session = _nextSession!;
    final athleteId = AppSession.athleteId!;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Prossima sessione', style: TextStyle(color: AppColors.grey, fontSize: 13)),
            const SizedBox(height: AppSpacing.xs),
            Text(
              session['sessionFocus'] as String? ?? 'Allenamento',
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.navy),
            ),
            if (session['status'] == 'MODIFIED') ...[
              const SizedBox(height: AppSpacing.sm),
              const Text(
                'Adattata in base al tuo ultimo feedback.',
                style: TextStyle(color: AppColors.warning, fontSize: 12),
              ),
            ],
            const SizedBox(height: AppSpacing.lg),
            ElevatedButton(
              onPressed: () {
                Navigator.of(context)
                    .push(
                      MaterialPageRoute(
                        builder: (_) => SessionDetailScreen(
                          athleteId: athleteId,
                          sessionId: session['id'] as String,
                        ),
                      ),
                    )
                    .then((_) => _load());
              },
              child: const Text('Vai alla sessione'),
            ),
          ],
        ),
      ),
    );
  }
}

/// F7 (docs/product-design FASE 7 §7.6): readiness sempre visibile prima di
/// iniziare la sessione — non un log passivo.
class _ReadinessCard extends StatefulWidget {
  const _ReadinessCard({required this.athleteId});

  final String athleteId;

  @override
  State<_ReadinessCard> createState() => _ReadinessCardState();
}

class _ReadinessCardState extends State<_ReadinessCard> {
  final _apiClient = ApiClient();
  bool _isLoading = true;
  Map<String, dynamic>? _checkin;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _isLoading = true);
    final checkin = await _apiClient.getTodayCheckin(widget.athleteId);
    if (!mounted) return;
    setState(() {
      _checkin = checkin;
      _isLoading = false;
    });
  }

  Future<void> _openCheckinForm() async {
    double sleepHours = 7;
    int sleepQuality = 3;
    int stressLevel = 5;

    await showDialog<void>(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (dialogContext, setDialogState) => AlertDialog(
          title: const Text('Come hai dormito?'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Ore di sonno: ${sleepHours.toStringAsFixed(1)}h'),
              Slider(
                value: sleepHours,
                min: 0,
                max: 12,
                divisions: 24,
                onChanged: (value) => setDialogState(() => sleepHours = value),
              ),
              Text('Qualità percepita: $sleepQuality/5'),
              Slider(
                value: sleepQuality.toDouble(),
                min: 1,
                max: 5,
                divisions: 4,
                onChanged: (value) => setDialogState(() => sleepQuality = value.round()),
              ),
              Text('Stress percepito: $stressLevel/10'),
              Slider(
                value: stressLevel.toDouble(),
                min: 1,
                max: 10,
                divisions: 9,
                onChanged: (value) => setDialogState(() => stressLevel = value.round()),
              ),
            ],
          ),
          actions: [
            ElevatedButton(
              onPressed: () async {
                Navigator.pop(dialogContext);
                await _apiClient.submitWellnessCheckin(
                  athleteId: widget.athleteId,
                  sleepHours: sleepHours,
                  sleepQuality: sleepQuality,
                  stressLevel: stressLevel,
                );
                await _load();
              },
              child: const Text('Salva'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const SkeletonBox(height: 72);
    }

    if (_checkin == null) {
      return Card(
        child: ListTile(
          leading: const Icon(Icons.bedtime_outlined, color: AppColors.navy),
          title: const Text('Come ti senti oggi?'),
          subtitle: const Text('Registra sonno e stress per calibrare la prontezza.'),
          trailing: ElevatedButton(onPressed: _openCheckinForm, child: const Text('Check-in')),
        ),
      );
    }

    final score = (_checkin!['readinessScore'] as num).toDouble();
    final color = score >= 75 ? AppColors.success : (score >= 50 ? AppColors.warning : AppColors.danger);

    return Card(
      child: ListTile(
        leading: Icon(Icons.circle, color: color, size: 18),
        title: Text('Prontezza: ${score.round()}/100'),
        subtitle: const Text('Tocca per aggiornare il check-in di oggi'),
        onTap: _openCheckinForm,
      ),
    );
  }
}

class _PlaceholderTab extends StatelessWidget {
  const _PlaceholderTab({required this.title, required this.subtitle});

  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: EmptyState(icon: Icons.hourglass_empty, title: title, message: subtitle),
    );
  }
}
