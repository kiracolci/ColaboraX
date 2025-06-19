"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<"userType" | "credentials">("userType");
  const [userType, setUserType] = useState<"company" | "employee" | null>(null);

  return (
    <div className="w-full">
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitting(true);
          const formData = new FormData(e.target as HTMLFormElement);
          formData.set("flow", flow);
          void signIn("password", formData).catch((error) => {
            let toastTitle = "";
            if (error.message.includes("Invalid password")) {
              toastTitle = "Invalid password. Please try again.";
            } else {
              toastTitle =
                flow === "signIn"
                  ? "Could not sign in, did you mean to sign up?"
                  : "Could not sign up, did you mean to sign in?";
            }
            toast.error(toastTitle);
            setSubmitting(false);
          });
        }}
      >
        <input
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffa731] focus:border-transparent text-sm"
          type="email"
          name="email"
          placeholder="Email"
          required
        />
        <input
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffa731] focus:border-transparent text-sm"
          type="password"
          name="password"
          placeholder="Password"
          required
        />
        <button 
          className="w-full bg-[#ffa731] text-[#2d2d2d] py-2.5 px-6 rounded-md hover:bg-[#ea580c] focus:outline-none focus:ring-2 focus:ring-[#ffa731] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-sm" 
          type="submit" 
          disabled={submitting}
        >
          {submitting ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#2d2d2d] mr-2"></div>
              {flow === "signIn" ? "Signing in..." : "Signing up..."}
            </span>
          ) : (
            flow === "signIn" ? "Sign in" : "Sign up"
          )}
        </button>
        <div className="text-center text-sm text-[#333]">
          <span>
            {flow === "signIn"
              ? "Don't have an account? "
              : "Already have an account? "}
          </span>
          <button
            type="button"
            className="text-[#ffa731] hover:text-[#ea580c] hover:underline font-medium cursor-pointer"
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
          >
            {flow === "signIn" ? "Sign up instead" : "Sign in instead"}
          </button>
        </div>
      </form>

    </div>
  );
}
