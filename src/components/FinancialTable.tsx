import React from 'react';
import type { YearlyResult } from '../types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(val);
};

export const FinancialTable: React.FC<{ data: YearlyResult[] }> = ({ data }) => {
    return (
        <div className="border rounded-md max-h-[500px] overflow-auto">
            <Table>
                <TableHeader className="bg-muted sticky top-0">
                    <TableRow>
                        <TableHead className="w-[80px]">年齢</TableHead>
                        <TableHead className="text-right">総収入 (Revenue)</TableHead>
                        <TableHead className="text-right">総支出 (Expense)</TableHead>
                        <TableHead className="text-right text-red-500">利子支払い</TableHead>
                        <TableHead className="text-right text-blue-500">元本返済</TableHead>
                        <TableHead className="text-right font-bold">年間収支 (CF)</TableHead>
                        <TableHead className="text-right">総資産</TableHead>
                        <TableHead className="text-right">総負債</TableHead>
                        <TableHead className="text-right font-bold">純資産</TableHead>

                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map(row => (
                        <TableRow key={row.age}>
                            <TableCell className="font-bold text-center">{row.age}</TableCell>
                            <TableCell className="text-right">{formatCurrency(row.revenue)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(row.expense)}</TableCell>
                            <TableCell className="text-right text-red-500">-{formatCurrency(row.loanInterestPayment)}</TableCell>
                            <TableCell className="text-right text-blue-500">-{formatCurrency(row.loanPrincipalPayment)}</TableCell>
                            <TableCell className={`text-right font-bold ${row.netCashFlow < 0 ? 'text-red-500' : 'text-green-600'}`}>
                                {formatCurrency(row.netCashFlow)}
                            </TableCell>
                            <TableCell className="text-right">{formatCurrency(row.totalAssets)}</TableCell>
                            <TableCell className="text-right text-gray-500">{formatCurrency(row.totalLiabilities)}</TableCell>
                            <TableCell className="text-right font-bold">{formatCurrency(row.netWorth)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};
