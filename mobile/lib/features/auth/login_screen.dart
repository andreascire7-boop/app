import 'package:flutter/material.dart';

import '../../core/router/app_router.dart';
import '../../core/theme/app_theme.dart';

/// S2 (docs/product-design FASE 6): social login in evidence, inline field
/// errors (never a generic popup), loading state confined to the submit button.
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  String? _errorText;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    final email = _emailController.text.trim();
    if (email.isEmpty || !email.contains('@')) {
      setState(() => _errorText = 'Inserisci un indirizzo email valido.');
      return;
    }

    setState(() {
      _errorText = null;
      _isSubmitting = true;
    });

    // TODO(M1.1): call the real auth provider (Firebase Auth) here, and skip
    // onboarding entirely when the returning user already has a completed profile.
    await Future.delayed(const Duration(milliseconds: 700));
    if (!mounted) return;

    setState(() => _isSubmitting = false);
    Navigator.of(context).pushReplacementNamed(AppRoutes.onboarding);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text(
                'Bentornato',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppColors.navy),
              ),
              const SizedBox(height: AppSpacing.lg),
              OutlinedButton.icon(
                onPressed: _isSubmitting ? null : _handleLogin,
                icon: const Icon(Icons.g_mobiledata),
                label: const Text('Continua con Google'),
              ),
              const SizedBox(height: AppSpacing.sm),
              OutlinedButton.icon(
                onPressed: _isSubmitting ? null : _handleLogin,
                icon: const Icon(Icons.apple),
                label: const Text('Continua con Apple'),
              ),
              const SizedBox(height: AppSpacing.lg),
              const Row(children: [
                Expanded(child: Divider()),
                Padding(
                  padding: EdgeInsets.symmetric(horizontal: AppSpacing.sm),
                  child: Text('oppure', style: TextStyle(color: AppColors.grey)),
                ),
                Expanded(child: Divider()),
              ]),
              const SizedBox(height: AppSpacing.lg),
              TextField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: InputDecoration(
                  labelText: 'Email',
                  errorText: _errorText,
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              TextField(
                controller: _passwordController,
                obscureText: true,
                decoration: const InputDecoration(labelText: 'Password'),
              ),
              const SizedBox(height: AppSpacing.lg),
              ElevatedButton(
                onPressed: _isSubmitting ? null : _handleLogin,
                child: _isSubmitting
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : const Text('Accedi'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
