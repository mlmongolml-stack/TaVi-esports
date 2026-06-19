import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";

export default function Login() {
  const [location, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [nicknameError, setNicknameError] = useState("");

  // Get redirect URL from query params or default to dashboard
  const redirectUrl = new URLSearchParams(window.location.search).get("redirect") || "/dashboard";

  const loginMutation = trpc.auth.loginLocal.useMutation({
    onSuccess: () => {
      toast.success("✅ Вхід успішний!");
      setLocation(redirectUrl);
    },
    onError: (error: any) => {
      const errorMsg = error?.message || "Помилка входу";
      console.error("[Login] Full error object:", error);
      console.error("[Login] Error message:", errorMsg);
      console.error("[Login] Error data:", error?.data);
      
      // Show specific field error if available
      if (error?.data?.zodError) {
        const zodErrors = error.data.zodError;
        console.error("[Login] Zod errors:", zodErrors);
        const fieldErrors = zodErrors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
        toast.error(`❌ ${fieldErrors}`);
        
        // Set individual field errors
        zodErrors.forEach((err: any) => {
          if (err.path[0] === 'email') setEmailError(err.message);
          if (err.path[0] === 'nickname') setNicknameError(err.message);
        });
      } else if (errorMsg.includes("pattern")) {
        toast.error("❌ Перевірте формат email та нікнейму");
      } else if (errorMsg.includes("email")) {
        toast.error("❌ Невірний формат email");
      } else {
        toast.error(`❌ ${errorMsg}`);
      }
    },
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setEmailError("");
    setNicknameError("");
    
    const trimmedEmail = email.trim();
    const trimmedNickname = nickname.trim();
    
    if (!trimmedEmail || !trimmedNickname) {
      toast.error("❌ Заповніть усі поля");
      return;
    }

    console.log("[Login] Attempting login with:", { email: trimmedEmail, nickname: trimmedNickname });
    console.log("[Login] Email type:", typeof trimmedEmail, "Length:", trimmedEmail.length);
    console.log("[Login] Nickname type:", typeof trimmedNickname, "Length:", trimmedNickname.length);

    setIsLoading(true);
    try {
      await loginMutation.mutateAsync({ email: trimmedEmail, nickname: trimmedNickname });
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
                placeholder="your@email.com"
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
                placeholder="YourNickname"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  setNicknameError("");
                }}
                className={`bg-slate-800 border-cyan-500/20 text-white placeholder:text-gray-500 ${nicknameError ? 'border-red-500' : ''}`}
              />
              {nicknameError && <p className="text-red-400 text-xs mt-1">{nicknameError}</p>}
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
