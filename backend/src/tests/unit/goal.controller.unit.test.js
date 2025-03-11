import { createGoal } from "../../controllers/goal.controller.js";
import GoalModel from "../../models/goal.model.js";
import sinon from "sinon";

describe("Goal Controller - Unit Test", () => {
  let createStub;

  beforeAll(() => {
    createStub = sinon.stub(GoalModel, "create");
  });

  afterAll(() => {
    sinon.restore();
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

    createStub.resolves(req.body);  // Mock the actual database call

    await createGoal(req, res);

    expect(res.status.calledWith(201)).toBe(true);
    expect(res.json.calledWithMatch({ success: true, data: req.body })).toBe(true);
    expect(createStub.calledOnce).toBe(true);  // Assert that create was called once
  });
});
