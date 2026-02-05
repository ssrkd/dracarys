export const COLOR_MAP: Record<string, string> = {
    'Черный': '#000000',
    'Белый': '#FFFFFF',
    'Красный': '#FF4B4B',
    'Синий': '#4B7BFF',
    'Зеленый': '#4BFF7B',
    'Желтый': '#FFEE4B',
    'Серый': '#8E8E93',
    'Бежевый': '#F5F5DC',
    'Коричневый': '#A52A2A',
    'Розовый': '#FFC0CB',
    'Оранжевый': '#FFA500',
    'Фиолетовый': '#800080',
    'Голубой': '#ADD8E6',
    'Темно-синий': '#000080',
    'Хаки': '#C3B091',
    'Оливковый': '#808000',
    'Бордовый': '#800000',
    'Песочный': '#C2B280',
    'Молочный': '#FDFFF5',
    'Графит': '#383838',
    'Без цвета': '#E5E7EB' // tailwind gray-200
};

export const getColorValue = (colorName: string): string => {
    if (!colorName) return COLOR_MAP['Без цвета'];

    // Check for exact match
    if (COLOR_MAP[colorName]) return COLOR_MAP[colorName];

    // Check for case-insensitive match
    const found = Object.entries(COLOR_MAP).find(
        ([name]) => name.toLowerCase() === colorName.toLowerCase()
    );

    if (found) return found[1];

    // Basic heuristic for common naming patterns
    const lower = colorName.toLowerCase();

    // Check for "темно" or "тёмно" first to map to darker shades
    if (lower.includes('темно-син') || lower.includes('тёмно-син')) return COLOR_MAP['Темно-синий'];
    if (lower.includes('темно-красн') || lower.includes('тёмно-красн')) return COLOR_MAP['Бордовый'];

    // Generic matches
    if (lower.includes('бежев')) return COLOR_MAP['Бежевый'];
    if (lower.includes('черн')) return COLOR_MAP['Черный'];
    if (lower.includes('бел')) return COLOR_MAP['Белый'];
    if (lower.includes('сер')) return COLOR_MAP['Серый'];
    if (lower.includes('син')) return COLOR_MAP['Синий'];
    if (lower.includes('красн')) return COLOR_MAP['Красный'];
    if (lower.includes('зелен')) return COLOR_MAP['Зеленый'];
    if (lower.includes('хаки')) return COLOR_MAP['Хаки'];
    if (lower.includes('песочн')) return COLOR_MAP['Песочный'];
    if (lower.includes('молочн')) return COLOR_MAP['Молочный'];

    return COLOR_MAP['Без цвета'];
};

export const isLightColor = (color: string): boolean => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155;
};
