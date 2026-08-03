import 'package:flutter/material.dart';

import '../../core/network/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/empty_state.dart';
import '../../core/widgets/error_state.dart';
import '../../core/widgets/skeleton_box.dart';

Color _riskColor(String level) => switch (level) {
      'GREEN' => AppColors.success,
      'YELLOW' => AppColors.warning,
      'RED' => AppColors.danger,
      _ => AppColors.grey,
    };

String _riskLabel(String level) => switch (level) {
      'GREEN' => 'Verde — nessun segnale rilevante',
      'YELLOW' => 'Giallo — monitora da vicino',
      'RED' => 'Rosso — riduci il carico',
      _ => level,
    };

/// S13 (docs/product-design FASE 6): semaforo sempre spiegato, mai un "tutto ok"
/// ingombrante — solo i fattori che contano, in linguaggio naturale.
class RiskCenterScreen extends StatefulWidget {
  const RiskCenterScreen({super.key, required this.athleteId});

  final String athleteId;

  @override
  State<RiskCenterScreen> createState() => _RiskCenterScreenState();
}

class _RiskCenterScreenState extends State<RiskCenterScreen> {
  final _apiClient = ApiClient();
  bool _isLoading = true;
  bool _isRefreshing = false;
  String? _error;
  Map<String, dynamic>? _risk;

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
      final risk = await _apiClient.getLatestRisk(widget.athleteId);
      if (!mounted) return;
      setState(() {
        _risk = risk;
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

  Future<void> _refresh() async {
    setState(() => _isRefreshing = true);
    try {
      final risk = await _apiClient.recomputeRisk(widget.athleteId);
      if (!mounted) return;
      setState(() {
        _risk = risk;
        _isRefreshing = false;
      });
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _isRefreshing = false;
        _error = e.message;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Centro rischio')),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Padding(
        padding: EdgeInsets.all(AppSpacing.lg),
        child: Column(children: [SkeletonBox(height: 120), SizedBox(height: AppSpacing.md), SkeletonBox(height: 200)]),
      );
    }
    if (_error != null) {
      return Center(child: ErrorState(message: _error!, onRetry: _load));
    }

    if (_risk == null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const EmptyState(
                icon: Icons.health_and_safety_outlined,
                title: 'Nessuna valutazione ancora disponibile',
                message: 'Richiedi la prima valutazione del rischio in base al tuo carico recente.',
              ),
              const SizedBox(height: AppSpacing.md),
              ElevatedButton(
                onPressed: _isRefreshing ? null : _refresh,
                child: _isRefreshing
                    ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))
                    : const Text('Valuta ora'),
              ),
            ],
          ),
        ),
      );
    }

    final level = _risk!['riskLevel'] as String;
    final factors = (_risk!['contributingFactors'] as List<dynamic>).cast<String>();
    final recommendation = _risk!['recommendationText'] as String?;

    return Padding(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            padding: const EdgeInsets.all(AppSpacing.lg),
            decoration: BoxDecoration(
              color: _riskColor(level).withOpacity(0.12),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: _riskColor(level)),
            ),
            child: Row(
              children: [
                Icon(Icons.circle, color: _riskColor(level), size: 20),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: Text(_riskLabel(level), style: const TextStyle(fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          const Text('Fattori considerati', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.navy)),
          const SizedBox(height: AppSpacing.sm),
          ...factors.map(
            (f) => Padding(
              padding: const EdgeInsets.only(bottom: AppSpacing.xs),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('• '),
                  Expanded(child: Text(f)),
                ],
              ),
            ),
          ),
          if (recommendation != null) ...[
            const SizedBox(height: AppSpacing.md),
            const Text('Raccomandazione', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.navy)),
            const SizedBox(height: AppSpacing.xs),
            Text(recommendation),
          ],
          const Spacer(),
          OutlinedButton(
            onPressed: _isRefreshing ? null : _refresh,
            child: _isRefreshing
                ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))
                : const Text('Aggiorna valutazione'),
          ),
        ],
      ),
    );
  }
}
