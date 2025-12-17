import axios from "axios";
import { createSession } from "@/lib/session";
import { onSubmit } from "@/app/page/LoginPage/functions/login-submit-function";

jest.mock("axios");
jest.mock("@/lib/session", () => ({
  createSession: jest.fn(),
}));

describe("onSubmit()", () => {
  const mockRouter = { push: jest.fn() };
  const mockValues = { email: "test@example.com", password: "123456" };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => { });
    jest.spyOn(console, "error").mockImplementation(() => { });
  });

  it("should login, save session and redirect", async () => {
    (axios.post as jest.Mock).mockResolvedValue({
      data: {
        user: { id: 1, name: "John Doe" },
        access_token: "access123",
        refresh_token: "refresh456",
      },
    });

    await onSubmit(mockValues as any, mockRouter as any);

    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost:8000/auth/Login",
      mockValues
    );

    expect(createSession).toHaveBeenCalledWith({
      user: { id: 1, name: "John Doe" },
      accessToken: "access123",
      refreshToken: "refresh456",
    });

    expect(mockRouter.push).toHaveBeenCalledWith("/page/HomePage");
  });

  it("should handle login error", async () => {
    const mockError = {
      response: { data: { message: "Invalid credentials" } },
    };

    (axios.post as jest.Mock).mockRejectedValue(mockError);

    const alertMock = jest.spyOn(window, "alert").mockImplementation(() => { });

    await onSubmit(mockValues as any, mockRouter as any);

    expect(alertMock).toHaveBeenCalledWith("Invalid credentials");
  });
});
