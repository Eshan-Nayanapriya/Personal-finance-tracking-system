import { expect } from "chai";
import sinon from "sinon";
import { deleteUser } from "../../controllers/user.controller.js";
import UserModel from "../../models/user.model.js";

describe("User Controller - deleteUser", () => {
    let req, res;
  
    beforeEach(() => {
      req = { params: { userId: "123" } };
      res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };
    });
  
    afterEach(() => {
      sinon.restore();
    });
  
    it("should delete a user successfully", async () => {
      const mockUser = { _id: "123", name: "John" };
      sinon.stub(UserModel, "findByIdAndDelete").resolves(mockUser);
  
      await deleteUser(req, res);
  
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({ success: true, message: "User deleted successfully" })).to.be.true;
    });
  
    it("should return 404 if user not found", async () => {
      sinon.stub(UserModel, "findByIdAndDelete").resolves(null);
  
      await deleteUser(req, res);
  
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ success: false, message: "User not found" })).to.be.true;
    });
  });
  