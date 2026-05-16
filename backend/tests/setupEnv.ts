process.env.NODE_ENV = "test";
process.env.PORT = "5001";
process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/team_tasks_test";
process.env.JWT_SECRET = "test-access-secret-with-at-least-thirty-two-chars";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-with-at-least-thirty-two-chars";
process.env.JWT_EXPIRES_IN = "15m";
process.env.JWT_REFRESH_EXPIRES_IN = "7d";
process.env.CLIENT_URL = "http://localhost:3000";
