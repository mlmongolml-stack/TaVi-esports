import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { toast } from "sonner";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loginMutation = trpc.auth.loginLocal.useMutation({
    onSuccess: () => {
      toast.success("✅ Вхід успішний!");
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast.error(`❌ ${error?.message || "Помилка входу"}`);
    },
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !nickname.trim()) {
      toast.error("❌ Заповніть усі поля");
      return;
    }

    setIsLoading(true);
    try {
      await loginMutation.mutateAsync({ email, nickname });
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
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-800 border-cyan-500/20 text-white placeholder:text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Нікнейм
              </label>
              <Input
                type="text"
                placeholder="YourNickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="bg-slate-800 border-cyan-500/20 text-white placeholder:text-gray-500"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold py-2 rounded-lg transition-all duration-300"
            >
              {isLoading ? "Завантаження..." : "Увійти"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-cyan-500/20">
            <p className="text-gray-400 text-sm mb-4">
              Немаєте облікового запису?
            </p>
            <Button
              onClick={() => setLocation("/register-team")}
              variant="outline"
              className="w-full border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
            >
              Реєстрація команди
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
