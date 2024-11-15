const suffixList = ["", "k", "M", "B", "T", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

export const formatCompact = (num: number, digits: number = 3): string => {
    if (num < 1) return string.format(`%.${digits - 1}f`, num);
    
    const tier = math.floor(math.log10(math.abs(num)) / 3);
    const scale = math.pow(10, tier * 3);
    const scaled = num / scale;
    const digit = math.floor(math.log10(math.abs(scaled))) + 1;
    if (tier === 0) return string.format(`%.${digits - digit}f`, scaled);
    const suffix = suffixList[tier];
    return string.format(`%.${digits - digit}f${suffix}`, scaled);
}