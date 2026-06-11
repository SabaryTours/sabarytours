import type { Metadata } from "next";
import LoginPage from "../pages/LoginPage";
import { NO_INDEX_ROBOTS } from "../lib/seo/site";

export const metadata: Metadata = {
  title: "Login | Sabary Tours",
  robots: NO_INDEX_ROBOTS,
};

export default function Login() {
  return <LoginPage />;
}

