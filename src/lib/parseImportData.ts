import { useStore } from '../store';

interface ParsedResult {
    incomes: any[];
    expenses: any[];
    events: any[];
    investments: any[];
    summary: {
        totalIncome: number;
        totalExpense: number;
        totalEvent: number;
        totalInvestment: number;
        count: number;
    };
    errors: string[];
}

const CLEAN_NUMBER = (str: string): number => {
    if (!str) return 0;
    // Replace full-width numbers, remove commas, remove "¥", "円"
    const cleaned = str
        .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
        .replace(/[,¥円\s]/g, '');
    return parseFloat(cleaned) || 0;
};

const DETECT_AGE = (str: string, currentAge: number, currentYear: number): number | undefined => {
    if (!str) return undefined;
    const num = CLEAN_NUMBER(str);
    if (num > 1900 && num < 2200) {
        // Assume Year
        return currentAge + (num - currentYear);
    }
    if (num >= 0 && num < 150) {
        // Assume Age
        return num;
    }
    return undefined;
};

export const parseImportData = (text: string): ParsedResult => {
    const lines = text.split('\n');
    const store = useStore.getState();
    const currentAge = store.settings.currentAge;
    const currentYear = store.settings.currentYear || new Date().getFullYear();

    let mode: 'INCOME' | 'INVESTMENT' | 'EXPENSE_DECISION' | null = null;
    let categoryPool: { [key: string]: number } = {};
    let parsedCount = 0;

    const newIncomes: any[] = [];
    const newExpenses: any[] = [];
    const newEvents: any[] = [];
    const newInvestments: any[] = [];
    const errors: string[] = [];

    lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return;

        const cols = line.split('\t').map(c => c.trim());
        const joined = cols.join(' ');

        // --- Header / Mode Detection ---
        if (joined.includes('金額(年間)')) {
            mode = 'INCOME';
            return;
        }
        if (joined.includes('金額(月間)')) {
            if (joined.includes('周期')) mode = 'EXPENSE_DECISION';
            else mode = 'INVESTMENT';
            return;
        }
        // General fallback for unknown headers that might look like headers
        if (joined.includes('費目') && joined.includes('金額')) {
            if (joined.includes('周期')) mode = 'EXPENSE_DECISION';
            else if (mode === 'INCOME') mode = 'INCOME'; // stay
            else mode = 'EXPENSE_DECISION';
            return;
        }

        // Row-based Mode Override
        let rowMode = mode;
        if (joined.includes('💰') || joined.includes('収入') || joined.includes('給与')) rowMode = 'INCOME';
        else if (joined.includes('💪') || joined.includes('自己投資')) rowMode = 'EXPENSE_DECISION'; // Exception: Self-Investment is Expense
        else if (joined.includes('💵') || joined.includes('投資')) rowMode = 'INVESTMENT';
        else if (joined.includes('🏠') || joined.includes('支出') || joined.includes('費')) rowMode = 'EXPENSE_DECISION';

        // --- Column Analysis ---
        // Find Amount Column (Key Anchor)
        let amountIndex = -1;
        let amountVal = 0;

        for (let i = 0; i < cols.length; i++) {
            const raw = cols[i];
            const val = CLEAN_NUMBER(raw);

            // Skip keywords that might parse as numbers
            if (raw.includes('年') || raw.includes('月') || raw.includes('回')) continue;
            if (val <= 0) continue;

            // Heuristic: valid amount matches
            amountIndex = i;
            amountVal = val;
            break;
        }

        if (amountIndex === -1) return;

        // Name Algorithm: "Category + Detail"
        // Category = cols[amountIndex - 2]
        // Detail = cols[amountIndex - 1]
        let nameParts: string[] = [];
        if (amountIndex >= 2 && cols[amountIndex - 2]) nameParts.push(cols[amountIndex - 2]);
        if (amountIndex >= 1 && cols[amountIndex - 1]) nameParts.push(cols[amountIndex - 1]);

        let name = nameParts.length > 0 ? nameParts.join(' ') : '不明';

        // Truncate if too long (e.g. > 15 chars)
        if (name.length > 15) {
            name = name.substring(0, 15) + '...';
        }

        // Period Algorithm & Start/End Age (Positional Strategy)
        let period = '';
        const periodKeywords = ['毎月', '1回', '一回', '年', '固定', '変動', 'だけ', '不定'];

        // Find Period Column Index
        let periodIndex = -1;
        // Prioritize: 1. Immediately right of Amount (Common)
        if (cols[amountIndex + 1] && periodKeywords.some(k => cols[amountIndex + 1].includes(k))) {
            period = cols[amountIndex + 1];
            periodIndex = amountIndex + 1;
        } else {
            // 2. Scan other columns (excluding amount)
            for (let i = 0; i < cols.length; i++) {
                if (i === amountIndex) continue;
                if (periodKeywords.some(k => cols[i].includes(k))) {
                    period = cols[i];
                    // Also update period if found here (might differ from initial guess?)
                    // Initial guess was scanning but didn't store index.
                    periodIndex = i;
                    break;
                }
            }
        }

        let startAge: number | undefined;
        let endAge: number | undefined;

        if (periodIndex !== -1) {
            // Positional Logic: [Period] [Start] [End]
            // Allow empty cells to mean undefined (default start/end)

            // Start Age (Period + 1)
            if (cols.length > periodIndex + 1) {
                const val = DETECT_AGE(cols[periodIndex + 1], currentAge, currentYear);
                // If val is valid number, use it. If undefined/empty, startAge remains undefined.
                if (val !== undefined) startAge = val;
            }

            // End Age (Period + 2)
            if (cols.length > periodIndex + 2) {
                const val = DETECT_AGE(cols[periodIndex + 2], currentAge, currentYear);
                // If val is valid number, use it. If undefined/empty, endAge remains undefined.
                if (val !== undefined) endAge = val;
            }
        } else {
            // Fallback if no period found: scan sequentially after amount (ignoring empty non-numeric strings)
            for (let i = amountIndex + 1; i < cols.length; i++) {
                const age = DETECT_AGE(cols[i], currentAge, currentYear);
                if (age !== undefined) {
                    if (startAge === undefined) startAge = age;
                    else if (endAge === undefined) endAge = age;
                }
            }
        }

        // Duration Object Logic
        // If start/end missing, return undefined (Forever).
        // If start present but end missing -> treat end as 100? Or just undefined means "From start to Forever".
        // Types: duration?: { startAge: number, endAge: number }
        const duration = (startAge !== undefined || endAge !== undefined)
            ? { startAge: startAge ?? currentAge, endAge: endAge ?? 100 }
            : undefined;

        try {
            if (rowMode === 'INCOME') {
                newIncomes.push({
                    id: crypto.randomUUID(),
                    name: name,
                    amount: amountVal,
                    startAge: startAge ?? currentAge,
                    endAge: endAge ?? 100, // Default to 100 (Forever) per user request
                    val: 0,
                    type: 'Labor',
                    growthRate: 0,
                });
            } else if (rowMode === 'INVESTMENT') {
                newInvestments.push({
                    id: crypto.randomUUID(),
                    name: name,
                    amount: amountVal * 12,
                    type: 'Taxable',
                    startAge: startAge ?? currentAge,
                    endAge: endAge ?? 100, // Default to 100 (Forever)
                    applyGrowth: true,
                });
            } else {
                // EXPENSE
                const basicLivingKeywords = ['食費', '日用品', '光熱費', '通信費', '水道', '電気', 'ガス'];
                if (basicLivingKeywords.some(k => name.includes(k))) {
                    let annual = amountVal;
                    if (period === '' || period.includes('毎月') || period.includes('月')) {
                        annual = amountVal * 12;
                    }
                    categoryPool['basic_living'] = (categoryPool['basic_living'] || 0) + annual;
                    return;
                }

                if (period.includes('毎月') || period === '') {
                    newExpenses.push({
                        id: crypto.randomUUID(),
                        name: name,
                        amount: amountVal * 12,
                        type: 'Living',
                        isMonthly: true,
                        duration: duration // Use calculated duration (undefined if missing)
                    });
                } else {
                    // Check for "X年に1回" (Periodic Reserve) - Check BEFORE "1回"
                    // Regex handles full-width numbers: 2年に1回, ２年に一回, 10年毎 etc.
                    const cleanPeriod = period.replace(/\s+/g, '');
                    const yearMatch = cleanPeriod.match(/([0-9０-９]+)年に?[1１一]?回/);

                    // Check for "Xヶ月に1回" (Periodic Annualized)
                    const monthMatch = cleanPeriod.match(/([0-9０-９]+)[ヶカヵか]月に?[1１一]?回/);

                    if (yearMatch) {
                        const years = CLEAN_NUMBER(yearMatch[1]); // Parse full-width number

                        if (years > 1) {
                            // True Periodic Reserve (2+ years)
                            newExpenses.push({
                                id: crypto.randomUUID(),
                                name: `${name} (積立)`,
                                amount: Math.ceil(amountVal / years), // Annualized amount, rounded up
                                type: 'Living',
                                isMonthly: false,
                                // Force duration to be continuous (Start -> 100)
                                duration: { startAge: startAge ?? currentAge, endAge: endAge ?? 100 }
                            });
                        } else if (years === 1) {
                            // "1年に1回" -> Standard Annual Expense
                            newExpenses.push({
                                id: crypto.randomUUID(),
                                name: name,
                                amount: amountVal,
                                type: 'Living',
                                isMonthly: false,
                                duration: duration // Use parsed duration
                            });
                        }
                    }
                    else if (monthMatch) {
                        // "X Months Once" -> Standard Annualized
                        // e.g. "6 Months Once" -> 2 times/year -> Amount * 2
                        const months = CLEAN_NUMBER(monthMatch[1]);
                        if (months > 0 && months <= 12) {
                            const frequency = 12 / months;
                            newExpenses.push({
                                id: crypto.randomUUID(),
                                name: name,
                                amount: Math.ceil(amountVal * frequency),
                                type: 'Living',
                                isMonthly: false,
                                duration: { startAge: startAge ?? currentAge, endAge: 100 }
                            });
                        } else {
                            newExpenses.push({
                                id: crypto.randomUUID(),
                                name: name,
                                amount: amountVal,
                                type: 'Living',
                                isMonthly: false,
                                duration: duration
                            });
                        }
                    }
                    else if (period.includes('月')) {
                        // Generic Monthly (contains 月 but wasn't caught by X months pattern)
                        newExpenses.push({
                            id: crypto.randomUUID(),
                            name: name,
                            amount: amountVal * 12,
                            type: 'Living',
                            isMonthly: true,
                            duration: duration
                        });
                    }
                    // Check for One-time (1回, 一回, だけ) IF not handled above
                    else if (period.includes('1回') || period.includes('一回') || period.includes('だけ')) {
                        if (amountVal >= 500000) {
                            newEvents.push({
                                id: crypto.randomUUID(),
                                name: name,
                                amount: amountVal,
                                age: startAge ?? currentAge,
                            });
                        } else {
                            newExpenses.push({
                                id: crypto.randomUUID(),
                                name: name,
                                amount: amountVal,
                                type: 'Living',
                                isMonthly: false,
                                // One-time small expense: specific year only
                                duration: { startAge: startAge ?? currentAge, endAge: startAge ?? currentAge }
                            });
                        }
                    }
                    // Fallback annual
                    else {
                        newExpenses.push({
                            id: crypto.randomUUID(),
                            name: name,
                            amount: amountVal,
                            type: 'Living',
                            isMonthly: false,
                            duration: duration // Undefined = Forever
                        });
                    }
                }
            }
        } catch (e: any) {
            errors.push(`Line ${index + 1}: ${e.message || e}`);
        }
        parsedCount++;
    });

    // Add aggregate
    if (categoryPool['basic_living'] > 0) {
        newExpenses.push({
            id: crypto.randomUUID(),
            name: '基本生活費 (食費・光熱費等)',
            amount: categoryPool['basic_living'],
            type: 'Living',
            isMonthly: true,
        });
    }

    newIncomes.forEach(i => store.addIncome(i));
    newInvestments.forEach(i => store.addInvestmentFlow(i));
    newEvents.forEach(e => store.addEvent(e));
    newExpenses.forEach(e => store.addRecurringExpense(e));

    return {
        errors,
        summary: {
            count: newIncomes.length + newExpenses.length + newEvents.length + newInvestments.length,
            totalIncome: newIncomes.reduce((s, c) => s + c.amount, 0),
            totalExpense: newExpenses.reduce((s, c) => s + c.amount, 0),
            totalEvent: newEvents.reduce((s, c) => s + c.amount, 0),
            totalInvestment: newInvestments.reduce((s, c) => s + c.amount, 0),
        },
        incomes: newIncomes,
        expenses: newExpenses,
        events: newEvents,
        investments: newInvestments
    };
};
