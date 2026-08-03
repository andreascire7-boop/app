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

  /// Returns null if no macrocycle exists yet (404) instead of throwing —
  /// callers treat that as an empty state, not an error.
  Future<Map<String, dynamic>?> getCurrentMacrocycle(String athleteId) async {
    final res = await _client.get(Uri.parse('$baseUrl/athletes/$athleteId/programming/macrocycle'));
    if (res.statusCode == 404) return null;
    return _decode(res);
  }

  Future<List<dynamic>> listSessions(String athleteId) async {
    final res = await _client.get(Uri.parse('$baseUrl/athletes/$athleteId/sessions'));
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw ApiException('Richiesta fallita (${res.statusCode}): ${res.body}');
    }
    return jsonDecode(res.body) as List<dynamic>;
  }

  Future<Map<String, dynamic>> getSession(String athleteId, String sessionId) async {
    final res = await _client.get(Uri.parse('$baseUrl/athletes/$athleteId/sessions/$sessionId'));
    return _decode(res);
  }

  Future<void> logExerciseSet({
    required String athleteId,
    required String sessionId,
    required String sessionExerciseId,
    required int setNumber,
    int? actualReps,
    double? actualLoad,
    double? actualRpe,
  }) async {
    final res = await _client.post(
      Uri.parse('$baseUrl/athletes/$athleteId/sessions/$sessionId/logs'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'sessionExerciseId': sessionExerciseId,
        'setNumber': setNumber,
        if (actualReps != null) 'actualReps': actualReps,
        if (actualLoad != null) 'actualLoad': actualLoad,
        if (actualRpe != null) 'actualRpe': actualRpe,
      }),
    );
    _decode(res);
  }

  Future<Map<String, dynamic>> submitSessionFeedback({
    required String athleteId,
    required String sessionId,
    double? sessionRpe,
    int? energyLevel,
    String? notes,
    String? painArea,
    int? painLevel,
  }) async {
    final res = await _client.post(
      Uri.parse('$baseUrl/athletes/$athleteId/sessions/$sessionId/feedback'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        if (sessionRpe != null) 'sessionRpe': sessionRpe,
        if (energyLevel != null) 'energyLevel': energyLevel,
        if (notes != null && notes.isNotEmpty) 'notes': notes,
        if (painArea != null) 'painArea': painArea,
        if (painLevel != null) 'painLevel': painLevel,
      }),
    );
    return _decode(res);
  }

  // --- Calendario gare (F3, S11-S12) ---

  Future<List<dynamic>> listCompetitions(String athleteId) async {
    final res = await _client.get(Uri.parse('$baseUrl/athletes/$athleteId/competitions'));
    return _decodeList(res);
  }

  Future<Map<String, dynamic>> createCompetition({
    required String athleteId,
    required String sport,
    required String eventDate,
    required String importance,
    int? expectedMatches,
  }) async {
    final res = await _client.post(
      Uri.parse('$baseUrl/athletes/$athleteId/competitions'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'sport': sport,
        'eventDate': eventDate,
        'importance': importance,
        if (expectedMatches != null) 'expectedMatches': expectedMatches,
      }),
    );
    return _decode(res);
  }

  Future<Map<String, dynamic>> cancelCompetition(String athleteId, String competitionId) async {
    final res = await _client.patch(
      Uri.parse('$baseUrl/athletes/$athleteId/competitions/$competitionId/cancel'),
    );
    return _decode(res);
  }

  // --- Centro rischio (F5, S13) ---

  Future<Map<String, dynamic>?> getLatestRisk(String athleteId) async {
    final res = await _client.get(Uri.parse('$baseUrl/athletes/$athleteId/risk'));
    if (res.statusCode == 200 && res.body.isNotEmpty && res.body != 'null') {
      return jsonDecode(res.body) as Map<String, dynamic>;
    }
    return null;
  }

  Future<Map<String, dynamic>> recomputeRisk(String athleteId) async {
    final res = await _client.post(Uri.parse('$baseUrl/athletes/$athleteId/risk'));
    return _decode(res);
  }

  // --- Recupero/readiness (F7) ---

  Future<Map<String, dynamic>?> getTodayCheckin(String athleteId) async {
    final res = await _client.get(Uri.parse('$baseUrl/athletes/$athleteId/wellness-checkins/today'));
    if (res.statusCode == 200 && res.body.isNotEmpty && res.body != 'null') {
      return jsonDecode(res.body) as Map<String, dynamic>;
    }
    return null;
  }

  Future<Map<String, dynamic>> submitWellnessCheckin({
    required String athleteId,
    double? sleepHours,
    int? sleepQuality,
    int? stressLevel,
  }) async {
    final res = await _client.post(
      Uri.parse('$baseUrl/athletes/$athleteId/wellness-checkins'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        if (sleepHours != null) 'sleepHours': sleepHours,
        if (sleepQuality != null) 'sleepQuality': sleepQuality,
        if (stressLevel != null) 'stressLevel': stressLevel,
      }),
    );
    return _decode(res);
  }

  // --- Nutrizione (F8, S15-S17) ---

  Future<Map<String, dynamic>?> getNutritionProfile(String athleteId) async {
    final res = await _client.get(Uri.parse('$baseUrl/athletes/$athleteId/nutrition/profile'));
    if (res.statusCode == 200 && res.body.isNotEmpty && res.body != 'null') {
      return jsonDecode(res.body) as Map<String, dynamic>;
    }
    return null;
  }

  Future<Map<String, dynamic>> upsertNutritionProfile({
    required String athleteId,
    String? bodyCompGoal,
    bool? disorderedEatingFlag,
  }) async {
    final res = await _client.post(
      Uri.parse('$baseUrl/athletes/$athleteId/nutrition/profile'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        if (bodyCompGoal != null) 'bodyCompGoal': bodyCompGoal,
        if (disorderedEatingFlag != null) 'disorderedEatingFlag': disorderedEatingFlag,
      }),
    );
    return _decode(res);
  }

  Future<Map<String, dynamic>> createNutritionRecommendation({
    required String athleteId,
    required String context,
    int? competitionDurationMinutes,
  }) async {
    final res = await _client.post(
      Uri.parse('$baseUrl/athletes/$athleteId/nutrition/recommendations'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'context': context,
        if (competitionDurationMinutes != null) 'competitionDurationMinutes': competitionDurationMinutes,
      }),
    );
    return _decode(res);
  }

  Future<List<dynamic>> listSupplements(String athleteId) async {
    final res = await _client.get(Uri.parse('$baseUrl/athletes/$athleteId/nutrition/supplements'));
    return _decodeList(res);
  }

  // --- Abbonamenti (scaffolding — nessun addebito reale, vedi mobile/README.md) ---

  Future<List<dynamic>> listPlans() async {
    final res = await _client.get(Uri.parse('$baseUrl/plans'));
    return _decodeList(res);
  }

  Future<Map<String, dynamic>?> getCurrentSubscription(String athleteId) async {
    final res = await _client.get(Uri.parse('$baseUrl/athletes/$athleteId/subscription'));
    if (res.statusCode == 200 && res.body.isNotEmpty && res.body != 'null') {
      return jsonDecode(res.body) as Map<String, dynamic>;
    }
    return null;
  }

  Future<Map<String, dynamic>> subscribeToPlan({required String athleteId, required String planId}) async {
    final res = await _client.post(
      Uri.parse('$baseUrl/athletes/$athleteId/subscriptions'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'planId': planId}),
    );
    return _decode(res);
  }

  Map<String, dynamic> _decode(http.Response res) {
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw ApiException('Richiesta fallita (${res.statusCode}): ${res.body}');
    }
    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  List<dynamic> _decodeList(http.Response res) {
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw ApiException('Richiesta fallita (${res.statusCode}): ${res.body}');
    }
    return jsonDecode(res.body) as List<dynamic>;
  }
}

class ApiException implements Exception {
  ApiException(this.message);
  final String message;

  @override
  String toString() => message;
}
