import { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { ArrowLeft, Plus, ChevronDown } from "lucide-react";
import { PersonSelect } from "@/components/PersonSelect";
import { AmountInput, formatAmountInput } from "@/components/AmountInput";
import { BankAccountInput } from "@/components/BankAccountInput";
import { DatePicker } from "@/components/DatePicker";
import { mockPersons } from "@/data/mock";
import type { Person, LoanType } from "@/types";

const LOAN_TYPE_LABELS: Record<LoanType, string> = {
  give: "Зээл өгөх",
  take: "Зээл авах",
};

const getToday = () => new Date().toISOString().split("T")[0];
const getOneWeekLater = () => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().split("T")[0];
};

export default function CreateLoan() {
  const navigate = useNavigate();
  const { type } = useParams<{ type: string }>();
  const loanType: LoanType = type === "give" || type === "take" ? type : "give";

  useEffect(() => {
    if (type && type !== "give" && type !== "take") {
      navigate("/loan/give", { replace: true });
    }
  }, [type, navigate]);

  const [users, setUsers] = useState<Person[]>(mockPersons);
  const [selectedUser, setSelectedUser] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("MNT");
  const [loanDate, setLoanDate] = useState(getToday);
  const [dueDate, setDueDate] = useState(getOneWeekLater);
  const [memo, setMemo] = useState("");
  const [senderBank, setSenderBank] = useState("other");
  const [senderAccount, setSenderAccount] = useState("");
  const [recipientBank, setRecipientBank] = useState("other");
  const [recipientAccount, setRecipientAccount] = useState("");
  const [showBankInfo, setShowBankInfo] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    // Mock: would save to Firestore
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 bg-background border-b border-border p-4 md:px-8 md:pt-8 flex flex-col gap-2 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="p-2 -ml-2 hover:bg-muted/30 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl md:text-3xl font-semibold">
            {LOAN_TYPE_LABELS[loanType]}
          </h1>
        </div>
        <nav className="hidden md:block text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">Нүүр</Link>
          <span className="mx-1">›</span>
          <span>{LOAN_TYPE_LABELS[loanType]}</span>
        </nav>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6 md:max-w-xl md:mx-auto md:px-8">
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm space-y-5">
          <div className="space-y-2.5">
            <label className="text-xs text-muted-foreground font-medium">
              {loanType === "give" ? "Зээл өгөх хүн" : "Зээл авах хүн"}
            </label>
            <PersonSelect
              users={users}
              onUsersChange={setUsers}
              value={selectedUser}
              onValueChange={setSelectedUser}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2.5">
              <label className="text-xs text-muted-foreground font-medium">
                {loanType === "give" ? "Зээл өгсөн өдөр" : "Зээл авсан өдөр"}
              </label>
              <DatePicker value={loanDate} onChange={setLoanDate} />
            </div>
            <div className="space-y-2.5">
              <label className="text-xs text-muted-foreground font-medium">Зээл төлөх өдөр</label>
              <DatePicker
                value={dueDate}
                onChange={setDueDate}
                fromDate={loanDate ? new Date(loanDate) : undefined}
              />
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="text-xs text-muted-foreground font-medium">
              {loanType === "give" ? "Зээлэх дүн" : "Зээл авах дүн"}
            </label>
            <AmountInput
              value={amount}
              onChange={setAmount}
              currency={currency}
              onCurrencyChange={setCurrency}
            />
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => setShowBankInfo((v) => !v)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Plus className="h-4 w-4" />
              Банкны мэдээлэл оруулах
              <ChevronDown className={`h-4 w-4 transition-transform ${showBankInfo ? "rotate-180" : ""}`} />
            </button>
            {showBankInfo && (
              <div className="space-y-4 pt-2">
                <div className="space-y-2.5">
                  <label className="text-xs text-muted-foreground font-medium">Илгээсэн данс</label>
                  <BankAccountInput bank={senderBank} onBankChange={setSenderBank} account={senderAccount} onAccountChange={setSenderAccount} />
                </div>
                <div className="space-y-2.5">
                  <label className="text-xs text-muted-foreground font-medium">Хүлээн авах данс</label>
                  <BankAccountInput bank={recipientBank} onBankChange={setRecipientBank} account={recipientAccount} onAccountChange={setRecipientAccount} />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2.5">
            <label className="text-xs text-muted-foreground font-medium">Тэмдэглэл (заавал биш)</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="Текст..."
              rows={3}
              className="w-full px-4 py-3.5 bg-muted/30 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring resize-y min-h-[80px] text-sm transition-shadow"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-foreground text-background py-4 rounded-2xl font-semibold hover:opacity-90 transition-all active:scale-[0.99] shadow-lg"
        >
          Үүсгэх
        </button>
      </form>
    </div>
  );
}
