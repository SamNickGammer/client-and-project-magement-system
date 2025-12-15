import { AppDispatch } from "./store";
import { logout } from "./store/features/userSlice";

interface Router {
    push: (href: string) => void;
}

export const handleLogout = async (dispatch: AppDispatch, router: Router) => {
    try {
        const response = await fetch("/api/auth/logout", {
            method: "POST",
        });

        if (response.ok) {
            dispatch(logout());
            router.push("/login");
        } else {
            console.error("Logout failed");
        }
    } catch (error) {
        console.error("Logout error:", error);
    }
};
