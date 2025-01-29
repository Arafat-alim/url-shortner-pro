// __tests__/auth.test.js

const request = require("supertest");
const app = require("../app"); // Your Express app
const passport = require("passport"); // Require passport

jest.mock("passport"); // Mock the entire passport module

describe("Authentication Routes", () => {
  it("should successfully authenticate with Google (Mock Success)", async () => {
    // Mock passport.authenticate to simulate a successful authentication
    passport.authenticate.mockImplementation((strategy, options, callback) => {
      // Instead of calling Google, immediately invoke the callback with a mock user
      const mockUser = {
        id: "123",
        displayName: "Test User",
        email: "test@example.com",
        _id: "mockuserForTest",
      };
      return (req, res, next) => {
        callback(null, mockUser, null); //Simulate success
      };
    });

    const res = await request(app).get("/auth/google/callback").expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Login successful");
    expect(res.body.token).toBeDefined(); // Check that a token was generated
    expect(res.body.user).toBeDefined(); // Check that the user data is returned.
  });

  it("should handle Google authentication failure (Mock Failure)", async () => {
    passport.authenticate.mockImplementation((strategy, options, callback) => {
      return (req, res, next) => {
        callback("Authentication Failed", null, null); // Simulate Failure
      };
    });

    await request(app).get("/auth/google/callback").expect(401);
  });

  //Add more tests for other authentication endpoints (logout, findMe)
});
