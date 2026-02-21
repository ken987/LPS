import React from 'react';
import { useStore } from '../store';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

import { ICON_BASE_PATH, getEventIconPath, getEventColorClass, getEducationStage } from '../lib/iconHelper';

export const LifeEventTimeline: React.FC = () => {
    const { settings, events, liabilities } = useStore((state) => state);
    const { currentAge, deathAge, family } = settings;

    // Simulation Range
    const startAge = currentAge;
    const endAge = deathAge;
    const totalYears = endAge - startAge + 1;

    const years = Array.from({ length: totalYears }, (_, i) => startAge + i);

    return (
        <Card className="w-full overflow-hidden border-none shadow-none bg-transparent">
            <CardHeader className="pb-2 pl-0">
                <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <span className="text-2xl">📅</span>
                    ライフイベント年表
                </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto pb-6 pl-0">
                <div className="w-full flex flex-col space-y-2 min-w-[800px]">

                    {/* Header: Calendar Year Axis */}
                    <div className="flex items-center text-xs text-muted-foreground">
                        <div className="w-[80px] flex-shrink-0 text-right pr-2 font-bold text-xs">
                            西暦
                        </div>
                        <div className="flex-1 flex relative pr-[30px]">
                            {years.map((age) => {
                                const delta = age - currentAge;
                                const calendarYear = (settings.currentYear || new Date().getFullYear()) + delta;
                                const isRoundDecade = calendarYear % 10 === 0;

                                return (
                                    <div key={age} className="flex-1 text-center border-l border-slate-200/50 relative group h-8 text-sm text-slate-600 font-medium">
                                        {isRoundDecade && (
                                            <span className="absolute left-0 -translate-x-1/2 block w-full text-center">
                                                {calendarYear}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Timeline Body: Family & Events */}
                    <div className="space-y-4 pt-2">

                        {/* 1. Events Row */}
                        <div className="flex items-start h-24">
                            <div className="w-[80px] flex-shrink-0 text-right pr-2 pt-2 text-sm font-bold text-slate-700">
                                イベント
                            </div>
                            <div className="flex-1 flex relative pr-[30px]">
                                {years.map((year) => {
                                    // 1. Manual Events
                                    const manualEvents = events.filter(e => e.age === year);

                                    // 2. Mortgage Payoff
                                    const payoffs = liabilities.filter(l => {
                                        const payoffYear = currentAge + l.remainingYears;
                                        const isHousing = l.name.includes('住宅') || l.name.includes('ローン') || l.name.includes('Mortgage');
                                        return isHousing && payoffYear === year;
                                    });

                                    return (
                                        <div key={year} className="flex-1 relative flex flex-col items-center pt-2">
                                            <div className="flex flex-col items-center gap-1 z-10 w-full">
                                                {/* Manual Events */}
                                                {manualEvents.map((ev) => (
                                                    <div
                                                        key={ev.id}
                                                        className="cursor-help hover:scale-150 transition-transform duration-200 relative z-20"
                                                        title={`${ev.name}: ${Math.round(ev.amount / 10000).toLocaleString()}万`}
                                                    >
                                                        <img
                                                            src={getEventIconPath(ev.name)}
                                                            alt={ev.name}
                                                            className={`w-6 h-6 min-w-6 min-h-6 max-w-none object-contain drop-shadow-sm ${getEventColorClass(ev.name)}`}
                                                        />
                                                    </div>
                                                ))}

                                                {/* Mortgage Payoff */}
                                                {payoffs.map((l, idx) => (
                                                    <div
                                                        key={`payoff-${idx}`}
                                                        className="cursor-help hover:scale-150 transition-transform duration-200 relative z-20"
                                                        title={`完済: ${l.name}`}
                                                    >
                                                        <img
                                                            src={getEventIconPath('完済')}
                                                            alt="完済"
                                                            className={`w-6 h-6 min-w-6 min-h-6 max-w-none object-contain drop-shadow-sm ${getEventColorClass('完済')}`}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 2. Family Tracks */}
                        <div className="space-y-1">
                            {[
                                { id: 'self', name: '本人', age: currentAge, relation: 'Self' },
                                ...family
                            ].map((member) => (
                                <div key={member.id} className="flex items-center h-12">
                                    <div className="w-[80px] flex-shrink-0 text-right pr-2 text-xs font-medium truncate text-slate-500" title={member.name}>
                                        {member.name}
                                    </div>
                                    <div className="flex-1 flex relative pr-[30px]">
                                        {years.map((year) => {
                                            const delta = year - currentAge;
                                            const memberAgeAtYear = member.age + delta;

                                            // Education logic
                                            let stage = null;
                                            if (member.relation === 'Child') {
                                                stage = getEducationStage(memberAgeAtYear);
                                            }

                                            const isStartOfStage = stage && memberAgeAtYear === stage.min;
                                            const isKanreki = memberAgeAtYear === 60;
                                            const isRoundAge = memberAgeAtYear >= 0 && memberAgeAtYear % 10 === 0;

                                            return (
                                                <div
                                                    key={year}
                                                    className={`flex-1 relative border-l border-slate-100 flex justify-center items-center ${stage ? stage.color : ''}`}
                                                    title={`${member.name} (${memberAgeAtYear}歳)${stage ? ': ' + stage.label : ''}`}
                                                >
                                                    {/* Age Marker (Low Priority) */}
                                                    {isRoundAge && !isStartOfStage && !isKanreki && (
                                                        <span className="text-[10px] text-slate-400 font-bold z-0 select-none">
                                                            {memberAgeAtYear}
                                                        </span>
                                                    )}

                                                    {/* Icons (High Priority) */}
                                                    {isStartOfStage && (
                                                        <div className="z-10 cursor-help hover:z-50 hover:scale-110 transition-transform duration-200 flex items-center justify-center">
                                                            <img
                                                                src={`${ICON_BASE_PATH}/${stage?.icon}`}
                                                                alt={stage?.label}
                                                                className={`w-6 h-6 object-contain flex-shrink-0 drop-shadow-sm ${getEventColorClass(stage?.label || '')}`}
                                                            />
                                                        </div>
                                                    )}
                                                    {isKanreki && (
                                                        <div className="z-10 cursor-help hover:z-50 hover:scale-110 transition-transform duration-200 flex items-center justify-center" title="還暦 (60歳)">
                                                            <img
                                                                src={getEventIconPath('還暦')}
                                                                alt="還暦"
                                                                className={`w-6 h-6 object-contain flex-shrink-0 drop-shadow-sm ${getEventColorClass('還暦')}`}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
