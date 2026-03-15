import { useState } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { ArrowLeft, Plus, ChevronDown } from "lucide-react";
import { ContactSelect } from "@/components/ContactSelect";
import { LoanSelect } from "@/components/LoanSelect";
import { AmountInput } from "@/components/AmountInput";
import { DatePicker } from "@/components/DatePicker";
import { BankAccountInput } from "@/components/BankAccountInput";
import { usePeopleForRepayment, useActiveLoansForPerson, useCreateRepayment, useCreateTransaction } from "@/hooks/useQueries";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { RepaymentType } from "@/types";

const REPAYMENT_TYPE_LABELS: Record<RepaymentType, string> = {
  pay: "Төлбөр төлөх",
  receive: "Төлбөр авах",
};

const getToday = () => new Date().toISOString().split("T")[0];

export default function RecordRepayment() {
  const navigate = useNavigate();
  const { type } = useParams<{ type: string }>();
  const repaymentType: RepaymentType = type === "pay" || type === "receive" ? type : "pay";
  const { appUser } = useAuth();
  const { toast } = useToast();
  const { data: peopleForRepayment = [] } = usePeopleForRepayment(repaymentType);
  const createRepayment = useCreateRepayment();
  const createTransaction = useCreateTransaction();

  const personOptions = peopleForRepayment.map((p) => ({
    id: p.personId,
    name: p.name,
  }));

  const [selectedPerson, setSelectedPerson] = useState("");
  const [selectedLoan, setSelectedLoan] = useState("");
  const [repaymentDate, setRepaymentDate] = useState(getToday);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("MNT");
  const [memo, setMemo] = useState("");
  const [showBankInfo, setShowBankInfo] = useState(false);
  const [senderBank, setSenderBank] = useState("other");
  const [senderAccount, setSenderAccount] = useState("");
  const [recipientBank, setRecipientBank] = useState("other");
  const [recipientAccount, setRecipientAccount] = useState("");

  const { data: userLoans = [] } = useActiveLoansForPerson(selectedPerson, repaymentType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPerson || !selectedLoan || !appUser) return;

    const personName = personOptions.find((p) => p.id === selectedPerson)?.name ?? "";

    createRepayment.mutate(
      {
        loanId: selectedLoan === "__manual__" ? "" : selectedLoan,
        amount: parseFloat(amount.replace(/,/g, "")) || 0,
        currency,
        repaymentDate,
        memo,
        type: repaymentType,
        createdBy: appUser.id,
        personName,
      },
      {
        onSuccess: (repayment) => {
          // Create transaction if bank info provided
          if (showBankInfo && (senderBank !== "other" || senderAccount || recipientBank !== "other" || recipientAccount)) {
            createTransaction.mutate({
              type: "repayment_recorded",
              loanId: null,
              repaymentId: repayment.id,
              transactionDate: repaymentDate,
              senderBank: senderBank !== "other" ? senderBank : null,
              senderAccount: senderAccount || null,
              recipientBank: recipientBank !== "other" ? recipientBank : null,
              recipientAccount: recipientAccount || null,
              memo,
            });
          }
          navigate("/", { replace: true });
        },
        onError: (err) =>
          toast({ title: "Алдаа", description: (err as Error).message, variant: "destructive" }),
      }
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 bg-background border-b border-border p-4 md:px-8 md:pt-8 flex flex-col gap-2 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-2 -ml-2 hover:bg-muted/30 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl md:text-3xl font-semibold">{REPAYMENT_TYPE_LABELS[repaymentType]}</h1>
        </div>
        <nav className="hidden md:block text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">Нүүр</Link>
          <span className="mx-1">›</span>
          <span>{REPAYMENT_TYPE_LABELS[repaymentType]}</span>
        </nav>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6 md:max-w-xl md:mx-auto md:px-8">
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm space-y-5">
          <div className="space-y-2.5">
            <label className="text-xs text-muted-foreground font-medium">
              {repaymentType === "pay" ? "Төлбөр төлөх хүн" : "Төлбөр авсан хүн"}
            </label>
            <ContactSelect
              friends={personOptions}
              value={selectedPerson}
              onValueChange={(v) => { setSelectedPerson(v); setSelectedLoan(""); }}
            />
          </div>

          {selectedPerson && (
            <div className="space-y-2.5">
              <label className="text-xs text-muted-foreground font-medium">
                {repaymentType === "pay" ? "Төлбөр төлөх зээлээ сонгоно уу" : "Төлбөр авсан зээлээ сонгоно уу"}
              </label>
              <LoanSelect loans={userLoans} value={selectedLoan} onValueChange={setSelectedLoan} />
            </div>
          )}

          <div className="space-y-2.5">
            <label className="text-xs text-muted-foreground font-medium">
              {repaymentType === "pay" ? "Төлбөр төлсөн дүн" : "Төлбөр авсан дүн"}
            </label>
            <AmountInput value={amount} onChange={setAmount} currency={currency} onCurrencyChange={setCurrency} />
          </div>

          <div className="space-y-2.5">
            <label className="text-xs text-muted-foreground font-medium">
              {repaymentType === "pay" ? "Төлбөр төлсөн өдөр" : "Төлбөр авсан өдөр"}
            </label>
            <DatePicker value={repaymentDate} onChange={setRepaymentDate} />
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
          disabled={createRepayment.isPending}
          className="w-full bg-foreground text-background py-4 rounded-2xl font-semibold hover:opacity-90 transition-all active:scale-[0.99] shadow-lg disabled:opacity-50"
        >
          {createRepayment.isPending ? "Бүртгэж байна..." : "Төлбөр бүртгэх"}
        </button>
      </form>
    </div>
  );
}
