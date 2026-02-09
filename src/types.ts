export type IncomeType = 'Labor' | 'Business' | 'Asset' | 'Pension' | 'Other';
export type AssetType = 'Cash' | 'Investment' | 'RealEstate' | 'Other';
export type LiabilityType = 'Mortgage' | 'CarLoan' | 'Other';
export type InvestmentFlowType = 'NISA' | 'iDeCo' | 'Taxable' | 'Other';

export interface IncomeSource {
    id: string;
    name: string;
    amount: number; // Annual Net Income
    startAge: number;
    endAge: number;
    growthRate: number; // %
    growthEndAge?: number; // Age at which growth stops (flattens)
    type: IncomeType;
    ownerId?: string; // ID of the family member who owns this income (optional, 'self' if undefined)
}

export interface Expense {
    id: string;
    name: string;
    amount: number;
    isLifeEvent: boolean;
    age: number; // For life events (single year)
}

export interface LifeEvent {
    id: string;
    name: string;
    amount: number;
    age: number;
    duration?: {
        startAge: number;
        endAge: number;
    };
    interval?: number;
}

export interface Asset {
    id: string;
    name: string;
    amount: number; // Current Value
    returnRate: number; // %
    type: AssetType;
}

export interface Liability {
    id: string;
    name: string;
    principal: number; // Remaining Balance
    interestRate: number; // %
    remainingYears: number;
}

export interface FamilyMember {
    id: string;
    name: string;
    relation: 'Spouse' | 'Child' | 'Other';
    age: number;
}

export interface Lifestyle {
    housingType: 'Rent' | 'OwnLoan' | 'OwnPaid';
    carCount: number;
    hasInsurance: boolean;
}

export interface RecurringExpense {
    id: string;
    name: string;
    amount: number; // Annual 
    type: 'Living' | 'Housing' | 'Education' | 'Vehicle' | 'Insurance' | 'Other';
    isMonthly: boolean; // UI helper: if true, show monthly input
    duration?: {
        startAge: number;
        endAge: number;
    }; // If defined, this expense only applies between these ages
    interval?: number; // Years between occurrences (e.g., 1 = every year, 2 = every other year)
}

export interface InvestmentFlow {
    id: string;
    name: string;
    amount: number; // Annual contribution
    type: InvestmentFlowType;
    startAge: number;
    endAge: number;
    applyGrowth: boolean; // If true, applies defaultReturnRate. If false, treated as Cash Savings.
}

export interface SimulationSettings {
    currentYear: number;
    currentAge: number;
    deathAge: number;
    baseLivingCost: number; // Annual
    inflationRate: number; // %
    cashReserve: number; // Current Cash in Bank
    cashName?: string; // Label for the cash reserve (default: '貯蓄')
    surplusAllocation?: 'Save' | 'Invest' | 'Spend'; // Surplus allocation strategy
    family: FamilyMember[];
    lifestyle: Lifestyle;
    defaultReturnRate: number; // % (Global assumption for new investments/flows)
}

export interface YearlyResult {
    age: number;
    revenue: number; // Total Income + Investment Returns
    expense: number; // Living Cost + Loan Interest + Life Events
    netCashFlow: number; // Revenue - Expense

    // Savings & Investment Flow (Annual)
    annualSavings: number;      // Cash Surplus (netCashFlow)
    annualInvestments: number;  // Investment Flow Amount
    savingsRate: number;        // (annualSavings + annualInvestments) / Revenue * 100
    totalAssets: number;
    totalLiabilities: number;
    netWorth: number;

    // Breakdowns for Charts
    incomeBreakdown: Record<string, number>; // { [IncomeName]: amount }
    assetBreakdown: {
        cash: number;
        investments: number;
        realEstate: number;
        other: number;
    };
    liabilityBreakdown: {
        principal: number; // Total Principal Remaining
    };

    // Loan Details
    loanInterestPayment: number;
    loanPrincipalPayment: number;
}
