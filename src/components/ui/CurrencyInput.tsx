import React, { useState, useEffect } from 'react';
import { Input } from './input';

interface CurrencyInputProps {
    value: number;
    onChange: (val: number) => void;
    placeholder?: string;
    className?: string;
}

const formatCurrency = (val: number) => `¥${val.toLocaleString()}`;

export const CurrencyInput: React.FC<CurrencyInputProps> = ({ value, onChange, placeholder, className }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [inputValue, setInputValue] = useState(value.toString());

    // Sync internal state with external value when not focused
    useEffect(() => {
        if (!isFocused) {
            setInputValue(value.toString());
        }
    }, [value, isFocused]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawVal = e.target.value;
        const numVal = Number(rawVal);

        // Allow empty string to mean 0 or just empty
        if (rawVal === '') {
            setInputValue('');
            onChange(0);
            return;
        }

        // Fix Leading Zero: "05" -> 5
        if (!isNaN(numVal)) {
            setInputValue(numVal.toString());
            onChange(numVal);
        }
    };

    return (
        <div className={`relative ${className}`}>
            <Input
                type={isFocused ? "number" : "text"}
                value={isFocused ? inputValue : (value > 0 ? formatCurrency(value) : '')}
                onChange={handleChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholder}
                className="pr-2"
            />
        </div>
    );
};
