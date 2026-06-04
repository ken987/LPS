export const ICON_BASE_PATH = '/icons';
export const DEFAULT_ICON = 'flag.png';

// Prioritized mapping rules
export const ICON_MAPPING: { keywords: string[]; icon: string }[] = [
    { keywords: ['保育', '幼稚園'], icon: 'nursery_infant.png' },
    { keywords: ['小学', 'ランドセル'], icon: 'elementary.png' },
    { keywords: ['中学'], icon: 'middle-school.png' },
    { keywords: ['高校'], icon: 'high-school.png' },
    { keywords: ['大学', '専門'], icon: 'university.png' },
    { keywords: ['起業', '独立'], icon: 'flag.png' },
    { keywords: ['定年', '退職', '還暦', '祝い'], icon: 'retirement_60th birthday.png' },
    { keywords: ['介護', 'ケア'], icon: 'nursing.png' },
    { keywords: ['結婚', '婚約', 'wedding'], icon: 'marriage.png' },
    { keywords: ['出産', '誕生', 'ベビー', 'baby', 'birth'], icon: 'baby.png' },
    { keywords: ['住宅', '家', 'マイホーム', 'マンション', 'home', 'house'], icon: 'house.png' },
    { keywords: ['リフォーム', '修繕', '外壁'], icon: 'renovation.png' },
    { keywords: ['車', '自動車', 'バイク', 'car', 'auto'], icon: 'car.png' },
    { keywords: ['旅行', '旅', 'trip', 'travel'], icon: 'trip.png' },
    { keywords: ['完済'], icon: 'payoff.png' },
];

export const getEventIconPath = (name: string): string => {
    const n = name.toLowerCase();
    const match = ICON_MAPPING.find((rule) =>
        rule.keywords.some((k) => n.includes(k.toLowerCase()))
    );
    return `${ICON_BASE_PATH}/${match ? match.icon : DEFAULT_ICON}`;
};

export const getEventColorClass = (name: string): string => {
    const n = name.toLowerCase();

    // Housing / Renovation -> Orange
    if (
        n.includes('住宅') ||
        n.includes('家') ||
        n.includes('home') ||
        n.includes('house') ||
        n.includes('リフォーム') ||
        n.includes('修繕') ||
        n.includes('外壁')
    ) {
        return 'text-orange-500';
    }

    // Car / Travel -> Blue
    if (
        n.includes('車') ||
        n.includes('カー') ||
        n.includes('auto') ||
        n.includes('car') ||
        n.includes('旅行') ||
        n.includes('旅') ||
        n.includes('trip') ||
        n.includes('travel')
    ) {
        return 'text-blue-500';
    }

    // Family / Celebration / Education / Welfare -> Pink
    if (
        n.includes('結婚') ||
        n.includes('婚約') ||
        n.includes('wedding') ||
        n.includes('出産') ||
        n.includes('誕生') ||
        n.includes('ベビー') ||
        n.includes('baby') ||
        n.includes('birth') ||
        n.includes('保育') ||
        n.includes('幼稚園') ||
        n.includes('小学') ||
        n.includes('ランドセル') ||
        n.includes('中学') ||
        n.includes('高校') ||
        n.includes('大学') ||
        n.includes('専門') ||
        n.includes('定年') ||
        n.includes('退職') ||
        n.includes('還暦') ||
        n.includes('祝い') ||
        n.includes('介護') ||
        n.includes('ケア')
    ) {
        return 'text-pink-500';
    }

    // Asset / Success -> Green
    if (n.includes('起業') || n.includes('独立') || n.includes('完済')) {
        return 'text-green-600';
    }

    // Default -> Gray
    return 'text-gray-500';
};

// --- Education Stages Definition ---
export const EDU_STAGES = [
    { label: '大学', min: 19, max: 23, color: 'bg-purple-200', text: 'text-purple-600', icon: 'university.png' },
    { label: '高校', min: 16, max: 19, color: 'bg-blue-200', text: 'text-blue-600', icon: 'high-school.png' },
    { label: '中学', min: 13, max: 16, color: 'bg-green-200', text: 'text-green-600', icon: 'middle-school.png' },
    { label: '小学校', min: 6, max: 13, color: 'bg-yellow-200', text: 'text-yellow-600', icon: 'elementary.png' },
    { label: '幼児', min: 3, max: 6, color: 'bg-pink-200', text: 'text-pink-600', icon: 'nursery_infant.png' },
];

export const getEducationStage = (age: number) => {
    return EDU_STAGES.find((s) => age >= s.min && age < s.max);
};
