import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Setup() {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    // Mock: would save to Firestore
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Хэрэглэгчийн нэр</h1>
          <p className="text-muted-foreground text-sm mt-2">
            Бусад хэрэглэгчдэд харагдах нэрээ оруулна уу
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Хэрэглэгчийн нэр"
            maxLength={30}
            className="w-full h-12 px-4 bg-muted/30 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
          <button
            type="submit"
            disabled={!username.trim()}
            className="w-full h-12 bg-foreground text-background rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            Үргэлжлүүлэх
          </button>
        </form>
      </div>
    </div>
  );
}
