/// Holds the current athlete id in memory for the duration of the app run.
/// Placeholder until real auth (Firebase, M1.1) replaces it with a persisted session.
class AppSession {
  AppSession._();

  static String? athleteId;
}
