
import { useRegisterHandler } from "@/app/page/RegisterPage/functions/submit-register";
import axios from "axios";
import { toast } from "react-toastify";

// Mock router phải được tạo GLOBAL để giữ reference
const mockRouter = { push: jest.fn() };

jest.mock("next/navigation", () => ({
    useRouter: () => mockRouter,
}));

jest.mock("axios");
jest.mock("react-toastify", () => ({
    toast: { error: jest.fn() },
}));

describe("useRegisterHandler - onSubmit", () => {
    const mockValues = {
        username: "testuser",
        email: "test@example.com",
        password: "123456",
    };

    let onSubmit: any;
    let alertMock: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();

        onSubmit = useRegisterHandler().onSubmit;

        alertMock = jest.spyOn(window, "alert").mockImplementation(() => { });
    });

    it("should register successfully and redirect user", async () => {
        (axios.post as jest.Mock).mockResolvedValue({
            data: { message: "success" },
        });

        await onSubmit(mockValues);

        expect(axios.post).toHaveBeenCalledWith(
            "http://localhost:8000/auth/SignUp",
            mockValues
        );

        expect(alertMock).toHaveBeenCalledWith("đăng ký thành công");

        // Quan trọng: Kiểm tra router MOCK bên trên
        expect(mockRouter.push).toHaveBeenCalledWith("/page/LoginPage");
    });

    it("should show toast error on failed registration", async () => {
        (axios.post as jest.Mock).mockRejectedValue({
            response: { data: { message: "Email already used" } },
        });

        await onSubmit(mockValues);

        expect(toast.error).toHaveBeenCalledWith("Lỗi: Email already used");
    });
});
