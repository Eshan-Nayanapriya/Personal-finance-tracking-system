import { expect } from "chai";
import sinon from "sinon";
import { getAllUsers } from "../../controllers/user.controller.js";
import UserModel from "../../models/user.model.js";

describe("User Controller - getAllUsers", () => {
  let res;

  beforeEach(() => {
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should return all users excluding passwords", async () => {
    const mockUsers = [{ _id: "1", name: "John" }, { _id: "2", name: "Jane" }];
    sinon.stub(UserModel, "find").resolves(mockUsers);

    await getAllUsers({}, res);

    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith({ success: true, data: mockUsers })).to.be.true;
  });

  it("should handle errors correctly", async () => {
    const error = new Error("Database error");
    sinon.stub(UserModel, "find").throws(error);

    await getAllUsers({}, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWith({ success: false, message: error.message })).to.be.true;
  });
});
