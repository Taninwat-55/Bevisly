import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getCandidateCredits } from "@/lib/api/credits";
import { Coins, History, TrendingUp, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";

export default function CandidateCredits() {
    const { user } = useAuth();
    const [credits, setCredits] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadCredits() {
            if (!user) return;
            try {
                const amount = await getCandidateCredits(user.id);
                setCredits(amount);
            } catch (err) {
                console.error("Failed to load credits", err);
                toast.error("Could not load credit balance.");
            } finally {
                setLoading(false);
            }
        }
        loadCredits();
    }, [user]);

    const PurchaseOption = ({ amount, price, popular }: { amount: number, price: number, popular?: boolean }) => (
        <div className={`relative p-6 rounded-2xl border transition-all hover:scale-[1.02] cursor-pointer bg-[var(--color-surface)] ${popular ? 'border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.2)]' : 'border-[var(--color-border)] hover:border-[var(--color-brand-primary)]'}`}>
            {popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-400 text-amber-950 text-xs font-bold rounded-full uppercase tracking-wide">
                    Most Popular
                </div>
            )}
            <div className="flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <Coins size={24} />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-[var(--color-text)]">{amount} Credits</h3>
                    <p className="text-[var(--color-text-muted)] text-sm mt-1">Perfect for {amount} proof submissions</p>
                </div>
                <div className="text-3xl font-bold text-[var(--color-text)]">${price}</div>
                <button disabled className="w-full px-4 py-2 rounded-lg text-sm font-medium text-[var(--color-text-muted)] bg-[var(--color-surface-hover)] border border-[var(--color-border)] cursor-not-allowed">
                    Stripe checkout coming soon
                </button>
            </div>
        </div>
    );

    if (loading) return (
        <div className="h-[60vh] flex flex-col items-center justify-center text-[var(--color-text-muted)]">
            <div className="w-8 h-8 rounded-full border-2 border-[var(--color-brand-primary)] border-t-transparent animate-spin mb-4" />
            <p>Loading your wallet...</p>
        </div>
    );

    return (
        <div className="space-y-8 pb-12">
            <header>
                <h1 className="heading-lg mb-2 flex items-center gap-3">
                    <ShoppingBag className="text-[var(--color-brand-primary)]" /> My Wallet
                </h1>
                <p className="text-[var(--color-text-muted)]">Manage your credits and view transaction history.</p>
            </header>

            {/* Balance Card */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-[var(--color-brand-primary)] to-purple-600 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <p className="text-blue-100 font-medium mb-1">Current Balance</p>
                        <div className="text-5xl font-bold font-display flex items-baseline gap-2">
                            {credits} <span className="text-2xl opacity-80 font-sans">Credits</span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="bg-white/20 backdrop-blur-md px-4 py-3 rounded-xl flex items-center gap-3">
                            <TrendingUp size={20} className="text-green-300" />
                            <div>
                                <p className="text-xs text-blue-100">Monthly Usage</p>
                                <p className="font-bold">2 Credits</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Purchase Options */}
            <div>
                <h2 className="heading-md mb-6">Top Up</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <PurchaseOption amount={1} price={9} />
                    <PurchaseOption amount={5} price={39} popular />
                    <PurchaseOption amount={10} price={69} />
                </div>
            </div>

            {/* History (Mock) */}
            <div className="pt-8 border-t border-[var(--color-border)]">
                <h2 className="heading-md mb-6 flex items-center gap-2">
                    <History size={20} /> Transaction History
                </h2>
                <div className="glass-panel border border-[var(--color-border)] rounded-xl overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[var(--color-surface-hover)] border-b border-[var(--color-border)]">
                            <tr>
                                <th className="px-6 py-4 font-medium text-[var(--color-text-muted)]">Date</th>
                                <th className="px-6 py-4 font-medium text-[var(--color-text-muted)]">Description</th>
                                <th className="px-6 py-4 font-medium text-[var(--color-text-muted)] text-right">Amount</th>
                                <th className="px-6 py-4 font-medium text-[var(--color-text-muted)]">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center">
                                    <p className="font-medium text-[var(--color-text)]">No transactions yet</p>
                                    <p className="text-xs text-[var(--color-text-muted)] mt-1">Your credit purchases and usage will appear here.</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
