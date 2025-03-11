import request from "supertest";
import app from "../../../index.js";
import mongoose from 'mongoose';
import { startServer } from "../../../index.js";
import { createGoal } from "../../controllers/goal.controller.js";
import GoalModel from "../../models/goal.model.js";
import sinon from "sinon";
import dbConnect from "../../configs/dbConfig.js";

let server;

beforeAll(async () => {
    // Start the server explicitly before running tests
    server = await startServer();  // Save the server reference
  });

  afterAll(async () => {
    // Close the server after all tests are done
    if (server) {
      server.close();  // Close the server properly
    }
    await mongoose.connection.close();  // Close the DB connection
  });

describe("Goal Controller", () => {
  afterEach(() => {
    sinon.restore(); // Restore mocks after each test
  });

  test("Should create a goal successfully", async () => {
    const req = {
      user: { id: "user123" },
      body: {
        name: "Vacation Fund",
        targetAmount: 5000,
        targetDate: "2025-12-31",
        autoAllocationPercentage: 20,
      },
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };

    sinon.stub(GoalModel, "create").resolves(req.body);

    await createGoal(req, res);

    expect(res.status.calledWith(201)).toBe(true);
    expect(res.json.calledWithMatch({ success: true, data: req.body })).toBe(
      true
    );
  });

  test("Should return error for missing fields", async () => {
    const req = { user: { id: "user123" }, body: {} };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

    await createGoal(req, res);

    expect(res.status.calledWith(400)).toBe(true);
    expect(res.json.calledWithMatch({ success: false })).toBe(true);
  });
});
