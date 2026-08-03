import 'package:flutter/material.dart';

import '../../core/network/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/error_state.dart';
import '../../core/widgets/skeleton_box.dart';
import 'supplements_screen.dart';

/// S15 (docs/product-design FASE 6): target macro del giorno in linguaggio
/// qualitativo. Se il guardrail di sicurezza scatta (S17), la sezione numerica
/// viene sostituita dal messaggio di rimando a un professionista — mai mostrata
/// insieme ai numeri.
class NutritionHubScreen extends StatefulWidget {
  const NutritionHubScreen({super.key, required this.athleteId});

  final String athleteId;

  @override
  State<NutritionHubScreen> createState() => _NutritionHubScreenState();
}

class _NutritionHubScreenState extends State<NutritionHubScreen> {
  final _apiClient = ApiClient();
  bool _isLoading = true;
  String? _error;
  Map<String, dynamic>? _recommendation;

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
      final recommendation = await _apiClient.createNutritionRecommendation(
        athleteId: widget.athleteId,
        context: 'DAILY',
      );
      if (!mounted) return;
      setState(() {
        _recommendation = recommendation;
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
    return Scaffold(
      appBar: AppBar(
        title: const Text('Nutrizione'),
        actions: [
          IconButton(
            icon: const Icon(Icons.medication_outlined),
            tooltip: 'Integratori',
            onPressed: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => SupplementsScreen(athleteId: widget.athleteId)),
            ),
          ),
        ],
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Padding(
        padding: EdgeInsets.all(AppSpacing.lg),
        child: Column(children: [SkeletonBox(height: 96), SizedBox(height: AppSpacing.md), SkeletonBox(height: 140)]),
      );
    }
    if (_error != null) {
      return Center(child: ErrorState(message: _error!, onRetry: _load));
    }

    final macroTargets = _recommendation!['macroTargets'] as Map<String, dynamic>;
    final suspended = macroTargets['numeric_guidance_suspended'] as bool;

    // S17: il guardrail sostituisce completamente la sezione numerica.
    if (suspended) {
      return Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.favorite_border, size: 48, color: AppColors.accent),
            const SizedBox(height: AppSpacing.md),
            Text(
              macroTargets['explanation'] as String,
              textAlign: TextAlign.center,
              style: const TextStyle(color: AppColors.navy),
            ),
            const SizedBox(height: AppSpacing.md),
            const Text(
              'Un nutrizionista o un medico può darti un supporto personalizzato e sicuro.',
              textAlign: TextAlign.center,
              style: TextStyle(color: AppColors.grey, fontSize: 13),
            ),
          ],
        ),
      );
    }

    final macroGuidance = (macroTargets['macro_guidance'] as Map<String, dynamic>);

    return ListView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      children: [
        const Text('Linee guida di oggi', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.navy)),
        const SizedBox(height: AppSpacing.sm),
        const Text(
          'Principi generali, non un piano clinico individualizzato.',
          style: TextStyle(color: AppColors.grey, fontSize: 12),
        ),
        const SizedBox(height: AppSpacing.md),
        ...macroGuidance.entries.map(
          (entry) => Card(
            margin: const EdgeInsets.only(bottom: AppSpacing.sm),
            child: ListTile(
              title: Text(entry.key[0].toUpperCase() + entry.key.substring(1)),
              subtitle: Text(entry.value as String),
            ),
          ),
        ),
      ],
    );
  }
}
