import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export default function Login() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Код илгээгдлээ!");
      setStep(2);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Өр<span className="text-muted-foreground font-normal">.mn</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            Хувь хүний өр зээлийн бүртгэл
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <Input
              type="email"
              placeholder="И-мэйл хаяг"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 rounded-xl"
            />
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl"
            >
              {loading ? "Илгээж байна..." : "Код илгээх"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{email}</span> руу
              илгээсэн 6 оронтой кодыг оруулна уу
            </p>
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={code}
                onChange={(val) => setCode(val)}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button
              type="submit"
              disabled={loading || code.length < 6}
              className="w-full h-12 rounded-xl"
            >
              {loading ? "Шалгаж байна..." : "Нэвтрэх"}
            </Button>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setCode("");
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              И-мэйл солих
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
