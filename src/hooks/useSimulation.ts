import { useMemo } from 'react';
import { useStore } from '../store';
import type { YearlyResult } from '../types';


export const useSimulation = () => {
    const { settings, incomes, events, assets, liabilities, recurringExpenses, investmentFlows } = useStore();

    const results = useMemo(() => {
        const data: YearlyResult[] = [];

        // Initial State
        let currentCash = settings.cashReserve;
        // We maintain state for separate assets and liabilities to track their individual growth/amortization
        const activeAssets = assets.map(a => ({ ...a }));
        const activeLiabilities = liabilities.map(l => ({ ...l, currentBalance: l.principal }));
        // Also track accumulated investment flow as a separate "Aggregate Investment" if needed, 
        // or just add to the first Investment asset? 
        let accumulatedInvestments = 0; // Risk Assets (subject to return)
        let accumulatedCashSavings = 0; // Safe Assets (no return)

        // Note: activeAssets already contains initial investments. 
        // We will grow 'accumulatedInvestments' separately and add it to total display.

        for (let age = settings.currentAge; age <= settings.deathAge; age++) {
            const yearIndex = age - settings.currentAge;

            // 1. Inflation adjustment
            const inflationFactor = Math.pow(1 + settings.inflationRate / 100, yearIndex);

            // 2. Base Living Cost & Recurring Expenses
            // Base Living Cost (Inflated)
            let yearLivingCost = settings.baseLivingCost * inflationFactor;

            // Add other recurring expenses (check duration)
            let otherRecurringCost = 0;
            recurringExpenses.forEach(exp => {
                let isActive = true;

                // 1. Check Duration (Start/End Age)
                const start = exp.duration?.startAge ?? settings.currentAge;
                if (exp.duration) {
                    if (age < exp.duration.startAge || age > exp.duration.endAge) {
                        isActive = false;
                    }
                }

                // 2. Check Interval (Frequency)
                if (isActive && exp.interval && exp.interval > 1) {
                    // Check if the current age aligns with the interval starting from 'start'
                    // e.g. Start 30, Interval 2 -> 30, 32, 34...
                    if ((age - start) % exp.interval !== 0) {
                        isActive = false;
                    }
                }

                if (isActive) {
                    otherRecurringCost += exp.amount * inflationFactor;
                }
            });

            // 3. Income Calculation
            let totalIncome = 0;
            const incomeBreakdown: Record<string, number> = {};

            incomes.forEach(inc => {
                if (age >= inc.startAge && age <= inc.endAge) {
                    // Determine how many years of growth apply
                    // Growth continues until 'age' reaches 'growthEndAge'.
                    // If 'age' is beyond 'growthEndAge', we use 'growthEndAge' to calculate the factor (flat thereafter).
                    const growthLimitAge = inc.growthEndAge || inc.endAge;
                    // effectiveAgeForGrowth was unused.
                    // growthYears was unused. effectiveGrowthYearIndex handles the logic.
                    // Note: original code used `yearIndex = age - currentAge`. 
                    // This implies growth starts from 'currentAge' (simulation start).
                    // If inc.startAge > currentAge, does growth start from startAge?

                    const effectiveGrowthYearIndex = Math.min(yearIndex, growthLimitAge - settings.currentAge);
                    const SafeGrowthYearIndex = Math.max(0, effectiveGrowthYearIndex);

                    const growthFactor = Math.pow(1 + (inc.growthRate || 0) / 100, SafeGrowthYearIndex);
                    const currentAmount = inc.amount * growthFactor;
                    totalIncome += currentAmount;
                    incomeBreakdown[inc.name] = (incomeBreakdown[inc.name] || 0) + currentAmount;
                }
            });

            // 4. Investment Returns (Asset Growth)
            let investmentReturns = 0;
            let totalInvestments = 0;
            let totalRealEstate = 0; // Legacy aggregator, maybe redundant if we use totalOther?
            let totalOther = 0;      // For RealEstate + Other

            // Grow existing assets
            activeAssets.forEach(asset => {
                if (asset.type === 'Investment') {
                    // Use GLOBAL default return rate for all Investment assets
                    const rate = settings.defaultReturnRate ?? 3.0;
                    const growth = asset.amount * (rate / 100);
                    investmentReturns += growth;
                    asset.amount += growth; // Reinvesting returns
                    totalInvestments += asset.amount;
                } else if (asset.type === 'RealEstate' || asset.type === 'Other') {
                    // Use INDIVIDUAL return rate for Real Assets
                    const rate = asset.returnRate ?? 0;
                    const change = asset.amount * (rate / 100);
                    asset.amount += change;
                    totalOther += asset.amount;
                    if (asset.type === 'RealEstate') totalRealEstate += asset.amount; // Keep tracking for legacy breakdown if needed
                } else if (asset.type === 'Cash') {
                    // Cash logic...
                    // totalInvestments += asset.amount; // Should remove this accumulation?
                    // Previous logic put Cash into totalInvestments? 
                    // Let's NOT add Cash to totalInvestments or totalOther. 
                    // Cash is tracked via currentCash (Flow) + accumulatedCashSavings.
                    // But 'activeAssets' contains INITIAL Cash Balance. 
                    // If we don't add it anywhere, it disappears from B/S?
                    // 'activeAssets' mapping for Cash:
                    // If type is Cash, we should probably add it to 'currentCash' at the start (Year 0) only? 
                    // OR treat it as a static asset that sits there?
                    // The 'currentCash' variable starts with 'settings.cashReserve'.
                    // If user adds a 'Cash' asset in G, is it duplicate of 'cashReserve'?
                    // Usually 'cashReserve' IS the Cash Asset.
                    // If G allows adding 'Cash' items, they should be added to B/S.
                    // Let's add them to 'totalOther' for now as "Other Assets"? No, specific 'Cash' bucket.
                    // Let's assume for now G 'Cash' items are just extra cash stashes.
                    // But they don't flow into 'currentCash' for spending?
                    // Let's treat them as 'Other' assets with 0% return for safety if type is Cash.
                    totalOther += asset.amount;
                }
            });

            // Grow accumulated flows (New Savings) - ONLY for Risk Assets
            const flowReturn = accumulatedInvestments * ((settings.defaultReturnRate ?? 3.0) / 100);
            investmentReturns += flowReturn;
            accumulatedInvestments += flowReturn;

            // Note: accumulatedCashSavings does NOT grow.

            // Total "Investments" for chart = Risk Assets
            totalInvestments += accumulatedInvestments;


            // 5. Investment Flows (Cash -> Asset)
            let yearInvestmentFlow = 0;
            let yearInvestFlow = 0; // Flows with applyGrowth: true
            let yearCashFlowAllocated = 0; // Flows with applyGrowth: false (Cash Savings)

            investmentFlows.forEach(flow => {
                if (age >= flow.startAge && age <= flow.endAge) {
                    yearInvestmentFlow += flow.amount;

                    if (flow.applyGrowth) {
                        accumulatedInvestments += flow.amount;
                        yearInvestFlow += flow.amount;
                    } else {
                        accumulatedCashSavings += flow.amount;
                        yearCashFlowAllocated += flow.amount;
                    }
                }
            });
            // Note: We subtract 'yearInvestmentFlow' from 'currentCash' (Cash Flow) later.
            // But we added it to 'accumulatedInvestments' or 'accumulatedCashSavings'.


            // 6. Liability Amortization (Loan)
            let totalLoanInterest = 0;
            let totalLoanPrincipalPayment = 0;
            let totalLiabilitiesBalance = 0;

            activeLiabilities.forEach(loan => {
                if (loan.currentBalance > 0) {
                    const r = loan.interestRate / 100 / 12; // Monthly rate
                    const n_total = loan.remainingYears * 12;
                    const P = (loan.principal * r * Math.pow(1 + r, n_total)) / (Math.pow(1 + r, n_total) - 1);
                    const monthlyPayment = (loan.interestRate === 0) ? (loan.principal / n_total) : P;

                    let yearInterest = 0;
                    let yearPrincipal = 0;

                    for (let m = 0; m < 12; m++) {
                        if (loan.currentBalance <= 0) break;
                        const interest = loan.currentBalance * r;
                        let principalPart = monthlyPayment - interest;
                        if (loan.currentBalance < principalPart) {
                            principalPart = loan.currentBalance;
                        }
                        yearInterest += interest;
                        yearPrincipal += principalPart;
                        loan.currentBalance -= principalPart;
                    }

                    totalLoanInterest += yearInterest;
                    totalLoanPrincipalPayment += yearPrincipal;
                    totalLiabilitiesBalance += loan.currentBalance;
                }
            });

            // 7. Life Events
            let eventCost = 0;
            events.forEach(e => {
                let isActive = false;

                if (e.duration) {
                    // Duration Mode
                    if (age >= e.duration.startAge && age <= e.duration.endAge) {
                        isActive = true;
                    }
                    // Interval check within duration
                    if (isActive && e.interval && e.interval > 1) {
                        if ((age - e.duration.startAge) % e.interval !== 0) {
                            isActive = false;
                        }
                    }
                } else {
                    // Single Year Mode (Original)
                    if (e.age === age) {
                        isActive = true;
                    }
                }

                if (isActive) {
                    eventCost += e.amount;
                }
            });

            // 8. Net Cash Flow
            // Revenue = Income
            // Expenses = Living + Other + Loan Interest + Event
            // Cash Out = Loan Principal + Investment Flow

            const totalExpenses = yearLivingCost + otherRecurringCost + totalLoanInterest + eventCost;

            // Note: Investment Flow is NOT an expense, it's a transfer. But it reduces currentCash.
            const netCashFlow = totalIncome - totalExpenses - totalLoanPrincipalPayment - yearInvestmentFlow;

            // Current state before applying netCashFlow (but after removing investment flow)
            // Wait, netCashFlow already subtracts investment flow.
            // If netCashFlow > 0: Surplus.
            // If netCashFlow < 0: Deficit.

            if (netCashFlow >= 0) {
                // --- SURPLUS ---
                if (settings.surplusAllocation === 'Invest') {
                    // Allocate to Investment
                    accumulatedInvestments += netCashFlow;
                    currentCash += 0;
                } else if (settings.surplusAllocation === 'Spend') {
                    // Consume Surplus
                    // Neither Cash nor Investment increases.
                    // Effectively, it's an extra expense.
                    currentCash += 0;
                } else {
                    // Allocate to Savings (Default)
                    currentCash += netCashFlow;
                }
            } else {
                // --- DEFICIT ---
                // 1. Deplete Cash First
                // currentCash will naturally decrease by adding negative netCashFlow
                currentCash += netCashFlow;

                // 2. If Cash goes negative, take from Investments
                if (currentCash < 0) {
                    const deficit = -currentCash; // Positive amount needed
                    if (accumulatedInvestments > 0) {
                        const coverage = Math.min(accumulatedInvestments, deficit);
                        accumulatedInvestments -= coverage;
                        currentCash += coverage; // Bring cash back up (towards 0)
                    }
                    // If still negative, it remains as debt in currentCash
                }
            }

            // 9. Compiler Result
            // Adjust Flow Reporting for Charts
            // If we allocated surplus to investments, move it from "annualSavings" (Cash) to "annualInvestments" (Investment)
            // purely for visualization in the "Savings & Savings Rate" chart.

            let displayAnnualSavings = netCashFlow + yearCashFlowAllocated;
            let displayAnnualInvestments = yearInvestFlow;

            if (netCashFlow > 0) {
                if (settings.surplusAllocation === 'Invest') {
                    displayAnnualSavings -= netCashFlow;
                    displayAnnualInvestments += netCashFlow;
                } else if (settings.surplusAllocation === 'Spend') {
                    // Remove surplus from Savings display (since it's spent)
                    displayAnnualSavings -= netCashFlow;
                    // Do NOT add to AnnualInvestments
                }
            }

            const totalSavingsAndInvestment = netCashFlow + yearInvestmentFlow; // Total "Money left over" + "Money purposefully invested"
            const revenueForRate = totalIncome + investmentReturns;
            const savingsRate = revenueForRate > 0
                ? (totalSavingsAndInvestment / revenueForRate) * 100
                : 0;

            data.push({
                age,
                revenue: totalIncome + investmentReturns,
                expense: totalExpenses,
                netCashFlow: netCashFlow,

                annualSavings: displayAnnualSavings,
                annualInvestments: displayAnnualInvestments,
                savingsRate: savingsRate,

                totalAssets: currentCash + totalInvestments + totalOther + accumulatedCashSavings,
                totalLiabilities: totalLiabilitiesBalance,
                netWorth: (currentCash + totalInvestments + totalOther + accumulatedCashSavings) - totalLiabilitiesBalance,

                incomeBreakdown: { ...incomeBreakdown, "Investment Growth": investmentReturns },
                assetBreakdown: {
                    cash: currentCash + accumulatedCashSavings,
                    investments: totalInvestments,
                    realEstate: totalRealEstate, // Keep for backward compat if needed
                    other: totalOther
                },
                liabilityBreakdown: {
                    principal: totalLiabilitiesBalance
                },
                loanInterestPayment: totalLoanInterest,
                loanPrincipalPayment: totalLoanPrincipalPayment
            });
        }
        return data;
    }, [settings, incomes, events, assets, liabilities, recurringExpenses, investmentFlows]);

    return results;
};
