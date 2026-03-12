import { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { ArrowLeft, Plus, ChevronDown } from "lucide-react";
import { ContactSelect } from "@/components/ContactSelect";
import { AmountInput } from "@/components/AmountInput";
import { BankAccountInput } from "@/components/BankAccountInput";
import { DatePicker } from "@/components/DatePicker";
import { LoanSuccessModal } from "@/components/LoanSuccessModal";
import { useFriends, useCreateLoan, useCreateShadowUserAndFriend, useCreateTransaction } from "@/hooks/useQueries";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { LoanType } from "@/types";

const LOAN_TYPE_LABELS: Record<LoanType, string> = {
  give: "Зээл өгөх",
  take: "Зээл авах",
};

const NEW_PREFIX = "__new__:";

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
  const { appUser } = useAuth();
  const { toast } = useToast();
  const { data: friendsData = [] } = useFriends();
  const createShadow = useCreateShadowUserAndFriend();
  const createLoan = useCreateLoan();
  const createTransaction = useCreateTransaction();

  useEffect(() => {
    if (type && type !== "give" && type !== "take") {
      navigate("/loan/give", { replace: true });
    }
  }, [type, navigate]);

  const friendOptions = friendsData.map((f) => ({
    id: f.friendId,
    name: f.friend.nickname || f.friend.username || f.friend.userCode,
  }));

  const [selectedPerson, setSelectedPerson] = useState("");
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [successModal, setSuccessModal] = useState<{
    open: boolean;
    approvalToken: string;
    amount: number;
    currency: string;
    personName: string;
  }>({ open: false, approvalToken: "", amount: 0, currency: "MNT", personName: "" });

  const isPendingNew = selectedPerson.startsWith(NEW_PREFIX);
  const pendingNewName = isPendingNew ? selectedPerson.slice(NEW_PREFIX.length) : "";

  // Store new person locally with __new__: prefix — no API call
  const handleCreateNew = (name: string) => {
    setSelectedPerson(`${NEW_PREFIX}${name}`);
  };

  // Get display name for selected person
  const getPersonName = () => {
    if (isPendingNew) return pendingNewName;
    return friendOptions.find((f) => f.id === selectedPerson)?.name ?? "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPerson || !appUser?.id) {
      if (!appUser?.id) {
        toast({ title: "Түр хүлээнэ үү", description: "Хэрэглэгчийн мэдээлэл ачаалагдаагүй байна.", variant: "destructive" });
      }
      return;
    }

    setIsSubmitting(true);
    try {
      // Step 1: If pending new person, create shadow user + friend
      let borrowerId = selectedPerson;
      if (isPendingNew) {
        const shadow = await createShadow.mutateAsync(pendingNewName);
        borrowerId = shadow.id;
      }

      const isGive = loanType === "give";
      const parsedAmount = parseFloat(amount.replace(/,/g, "")) || 0;

      // Step 2: Create loan
      const loan = await createLoan.mutateAsync({
        lenderId: isGive ? appUser.id : borrowerId,
        borrowerId: isGive ? borrowerId : appUser.id,
        amount: parsedAmount,
        currency,
        loanDate,
        dueDate,
        memo,
        type: loanType,
        approvalToken: null,
        createdBy: appUser.id,
      });

      // Step 3: Create transaction if bank info provided
      if (showBankInfo && (senderBank !== "other" || senderAccount || recipientBank !== "other" || recipientAccount)) {
        await createTransaction.mutateAsync({
          type: "loan_created",
          loanId: loan.id,
          repaymentId: null,
          transactionDate: loanDate,
          senderBank: senderBank !== "other" ? senderBank : null,
          senderAccount: senderAccount || null,
          recipientBank: recipientBank !== "other" ? recipientBank : null,
          recipientAccount: recipientAccount || null,
          memo,
        });
      }

      // Step 4: Show success modal
      setSuccessModal({
        open: true,
        approvalToken: loan.approvalToken ?? "",
        amount: loan.amount,
        currency: loan.currency,
        personName: getPersonName(),
      });
    } catch (err) {
      toast({ title: "Алдаа", description: (err as Error).message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Augment friend options with pending new person for display
  const displayOptions = isPendingNew
    ? [...friendOptions, { id: selectedPerson, name: pendingNewName }]
    : friendOptions;

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
            <ContactSelect
              friends={displayOptions}
              value={selectedPerson}
              onValueChange={setSelectedPerson}
              onCreateNew={handleCreateNew}
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
          disabled={isSubmitting || !selectedPerson}
          className="w-full bg-foreground text-background py-4 rounded-2xl font-semibold hover:opacity-90 transition-all active:scale-[0.99] shadow-lg disabled:opacity-50"
        >
          {isSubmitting ? "Үүсгэж байна..." : "Үүсгэх"}
        </button>
      </form>

      <LoanSuccessModal
        open={successModal.open}
        onClose={() => {
          setSuccessModal((s) => ({ ...s, open: false }));
          navigate("/", { replace: true });
        }}
        approvalToken={successModal.approvalToken}
        amount={successModal.amount}
        currency={successModal.currency}
        personName={successModal.personName}
      />
    </div>
  );
}
