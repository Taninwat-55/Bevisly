import { useState, useEffect, createContext, useContext, type ReactNode } from "react";
import { getCurrentCompany, getUserCompanies } from "@/lib/api/companies";
import type { Company } from "@/types";

interface CompanyContextValue {
    company: Company | null;
    companies: Company[];
    loading: boolean;
    refresh: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextValue>({
    company: null,
    companies: [],
    loading: true,
    refresh: async () => { },
});

export function CompanyProvider({ children }: { children: ReactNode }) {
    const [company, setCompany] = useState<Company | null>(null);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = async () => {
        setLoading(true);
        try {
            const [current, all] = await Promise.all([
                getCurrentCompany(),
                getUserCompanies(),
            ]);
            setCompany(current);
            setCompanies(all);
        } catch (err) {
            console.error("Error loading companies:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh();
    }, []);

    return (
        <CompanyContext.Provider value={{ company, companies, loading, refresh }}>
            {children}
        </CompanyContext.Provider>
    );
}

// Re-export hook from this file - ESLint react-refresh allows hooks alongside providers
// eslint-disable-next-line react-refresh/only-export-components
export function useCompany() {
    const context = useContext(CompanyContext);
    if (!context) {
        throw new Error("useCompany must be used within a CompanyProvider");
    }
    return context;
}
