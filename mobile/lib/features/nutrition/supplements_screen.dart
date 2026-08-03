import 'package:flutter/material.dart';

import '../../core/network/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/error_state.dart';
import '../../core/widgets/skeleton_box.dart';

/// S16 (docs/product-design FASE 6): contenuto educativo, nessuna azione
/// di acquisto — evita l'impressione di endorsement commerciale non dichiarato.
class SupplementsScreen extends StatefulWidget {
  const SupplementsScreen({super.key, required this.athleteId});

  final String athleteId;

  @override
  State<SupplementsScreen> createState() => _SupplementsScreenState();
}

class _SupplementsScreenState extends State<SupplementsScreen> {
  final _apiClient = ApiClient();
  bool _isLoading = true;
  String? _error;
  List<dynamic> _supplements = [];

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
      final supplements = await _apiClient.listSupplements(widget.athleteId);
      if (!mounted) return;
      setState(() {
        _supplements = supplements;
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
      appBar: AppBar(title: const Text('Integratori')),
      body: _isLoading
          ? const Padding(
              padding: EdgeInsets.all(AppSpacing.lg),
              child: Column(children: [SkeletonBox(height: 80), SizedBox(height: AppSpacing.sm), SkeletonBox(height: 80)]),
            )
          : _error != null
              ? Center(child: ErrorState(message: _error!, onRetry: _load))
              : ListView.builder(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  itemCount: _supplements.length,
                  itemBuilder: (context, index) {
                    final supplement = _supplements[index] as Map<String, dynamic>;
                    return Card(
                      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
                      child: ExpansionTile(
                        title: Text(supplement['name'] as String),
                        subtitle: Text('Evidenza: ${supplement['evidenceTier']}'),
                        children: [
                          Padding(
                            padding: const EdgeInsets.fromLTRB(
                              AppSpacing.md,
                              0,
                              AppSpacing.md,
                              AppSpacing.md,
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                if (supplement['typicalDosage'] != null)
                                  Text('Dosaggio indicativo: ${supplement['typicalDosage']}'),
                                if (supplement['cautions'] != null) ...[
                                  const SizedBox(height: AppSpacing.xs),
                                  Text(
                                    supplement['cautions'] as String,
                                    style: const TextStyle(color: AppColors.grey, fontSize: 12),
                                  ),
                                ],
                              ],
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
    );
  }
}
