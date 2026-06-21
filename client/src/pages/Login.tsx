import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [nicknameError, setNicknameError] = useState("");

  // Get redirect URL from query params or default to dashboard
  const redirectUrl = new URLSearchParams(window.location.search).get("redirect") || "/dashboard";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setEmailError("");
    setNicknameError("");
    
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedNickname = nickname.trim();
    
    // Client-side validation
    if (!trimmedEmail) {
      setEmailError("Email обов'язковий");
      toast.error("❌ Заповніть email");
      return;
    }
    
    if (!trimmedNickname) {
      setNicknameError("Нікнейм обов'язковий");
      toast.error("❌ Заповніть нікнейм");
      return;
    }

    // Basic email format check
    if (!trimmedEmail.includes("@")) {
      setEmailError("Невірний email");
      toast.error("❌ Email повинен містити @");
      return;
    }

    // Nickname length check
    if (trimmedNickname.length < 1) {
      setNicknameError("Нікнейм обов'язковий");
      toast.error("❌ Заповніть нікнейм");
      return;
    }

    if (trimmedNickname.length > 32) {
      setNicknameError("Максимум 32 символи");
      toast.error("❌ Нікнейм: максимум 32 символи");
      return;
    }

    console.log("[Login] Submitting:", { email: trimmedEmail, nickname: trimmedNickname });

    setIsLoading(true);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmedEmail,
          nickname: trimmedNickname,
        }),
      });

      const data = await response.json();
      console.log("[Login] Response:", data);

      if (!response.ok) {
        toast.error(`❌ ${data.error || "Login failed"}`);
        return;
      }

      // Success
      toast.success("✅ Вхід успішний!");
      
      // Redirect after a short delay
      setTimeout(() => {
        setLocation(redirectUrl);
      }, 500);
    } catch (err) {
      console.error("[Login] Error:", err);
      toast.error("❌ Помилка мережі. Спробуйте ще раз.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-cyan-500/30 bg-slate-900/80 backdrop-blur">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-2">
            TaVi Esports
          </h1>
          <p className="text-gray-400 mb-8">Увійти до турнірної платформи</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <Input
                type="text"
                inputMode="email"
                placeholder="ml.mongol.ml@gmail.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError("");
                }}
                className={`bg-slate-800 border-cyan-500/20 text-white placeholder:text-gray-500 ${emailError ? 'border-red-500' : ''}`}
              />
              {emailError && <p className="text-red-400 text-xs mt-1">{emailError}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Нікнейм
              </label>
              <Input
                type="text"
                placeholder="Akusher"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  setNicknameError("");
                }}
                className={`bg-slate-800 border-cyan-500/20 text-white placeholder:text-gray-500 ${nicknameError ? 'border-red-500' : ''}`}
              />
              {nicknameError && <p className="text-red-400 text-xs mt-1">{nicknameError}</p>}
              <p className="text-gray-500 text-xs mt-1">1-32 символи</p>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold py-2 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              {isLoading ? "Завантаження..." : "Увійти"}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Перший вхід автоматично створить акаунт
          </p>
        </div>
      </Card>
    </div>
  );
}
