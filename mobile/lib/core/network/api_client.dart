import 'dart:convert';
import 'dart:io' show Platform;

import 'package:http/http.dart' as http;

/// Thin HTTP client for the Core API (NestJS — docs/product-design FASE 4 §4.2).
/// No auth/session layer yet (M1.1 is not finished): every call is unauthenticated.
class ApiClient {
  ApiClient({http.Client? client}) : _client = client ?? http.Client();

  final http.Client _client;

  // Android emulator can't reach the host's "localhost" directly — 10.0.2.2 is its
  // alias for the host loopback. iOS simulator and physical devices need adjusting
  // (see mobile/README.md) once this moves past local dev. Mobile-only app (the web
  // dashboard is a separate Next.js codebase per docs/product-design FASE 4 §4.1),
  // so a dart:io Platform check is always safe here.
  static String get baseUrl {
    if (Platform.isAndroid) {
      return 'http://10.0.2.2:3000';
    }
    return 'http://localhost:3000';
  }

  Future<Map<String, dynamic>> createUser({
    required String email,
    required String fullName,
  }) async {
    final res = await _client.post(
      Uri.parse('$baseUrl/users'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'authProviderId': 'dev-$email',
        'fullName': fullName,
        'role': 'ATHLETE',
      }),
    );
    return _decode(res);
  }

  Future<Map<String, dynamic>> upsertProfile({
    required String athleteId,
    required String primarySport,
    required String level,
    required int weeklyAvailabilityDays,
    String? goalPrimary,
  }) async {
    final res = await _client.post(
      Uri.parse('$baseUrl/athletes/$athleteId/profile'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'primarySport': primarySport,
        'level': level,
        'weeklyAvailabilityDays': weeklyAvailabilityDays,
        if (goalPrimary != null && goalPrimary.isNotEmpty) 'goalPrimary': goalPrimary,
      }),
    );
    return _decode(res);
  }

  Future<void> reportInjury({
    required String athleteId,
    required String bodyArea,
    required int severityAtReport,
    String? description,
  }) async {
    final res = await _client.post(
      Uri.parse('$baseUrl/athletes/$athleteId/profile/injuries'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'bodyArea': bodyArea,
        'severityAtReport': severityAtReport,
        if (description != null && description.isNotEmpty) 'description': description,
      }),
    );
    _decode(res);
  }

  Future<Map<String, dynamic>> generateMacrocycle(String athleteId) async {
    final res = await _client.post(Uri.parse('$baseUrl/athletes/$athleteId/programming/macrocycle'));
    return _decode(res);
  }

  Map<String, dynamic> _decode(http.Response res) {
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw ApiException('Richiesta fallita (${res.statusCode}): ${res.body}');
    }
    return jsonDecode(res.body) as Map<String, dynamic>;
  }
}

class ApiException implements Exception {
  ApiException(this.message);
  final String message;

  @override
  String toString() => message;
}
