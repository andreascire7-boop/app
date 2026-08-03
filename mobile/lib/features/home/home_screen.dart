import 'package:flutter/material.dart';

import '../../core/network/api_client.dart';
import '../../core/session/app_session.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/empty_state.dart';
import '../../core/widgets/error_state.dart';
import '../../core/widgets/skeleton_box.dart';
import '../session/session_detail_screen.dart';

/// S6 (docs/product-design FASE 6): bottom nav Home · Programma · Nutrizione ·
/// Profilo. Home shows a loading skeleton, then either today's session or a
/// positive empty state on rest days — never a blank screen.
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    final tabs = [
      const _HomeTab(),
      const _PlaceholderTab(
        title: 'Programma',
        subtitle: 'Timeline macro/meso/microciclo — in arrivo (milestone M1.2, FASE 9).',
      ),
      const _PlaceholderTab(
        title: 'Nutrizione',
        subtitle: 'Hub nutrizionale — in arrivo (milestone M2.5, FASE 9).',
      ),
      const _PlaceholderTab(
        title: 'Profilo',
        subtitle: 'Impostazioni account e abbonamento — in arrivo (milestone M3.1, FASE 9).',
      ),
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('S&C Intelligence')),
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
    if (_isLoading) {
      return const Padding(
        padding: EdgeInsets.all(AppSpacing.lg),
        child: Column(
          children: [
            SkeletonBox(height: 96),
            SizedBox(height: AppSpacing.md),
            SkeletonBox(height: 140),
          ],
        ),
      );
    }

    if (_error != null) {
      return Center(child: ErrorState(message: _error!, onRetry: _load));
    }

    if (_nextSession == null) {
      return const Center(
        child: EmptyState(
          icon: Icons.self_improvement,
          title: 'Nessuna sessione pianificata',
          message: 'Il tuo prossimo allenamento non è ancora stato generato, '
              'oppure oggi è un giorno di riposo. Priorità al recupero: sonno prima di tutto.',
        ),
      );
    }

    final session = _nextSession!;
    final athleteId = AppSession.athleteId!;

    return Padding(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Card(
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
