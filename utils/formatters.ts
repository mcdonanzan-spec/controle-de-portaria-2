export const formatDocument = (value: string): string => {
    if (!value) return '';
    // Remove all non-digit characters
    const cleaned = value.replace(/[^\d]/g, '');

    const length = cleaned.length;

    if (length <= 11) {
        if (length > 9) { // CPF format
            return cleaned
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        } else { // RG format (common mask, may vary by state)
             return cleaned
                .replace(/(\d{2})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d{1})$/, '$1-$2');
        }
    }
    
    // If a long number is pasted, truncate to CPF length and format
    const truncated = cleaned.slice(0, 11);
    return truncated
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};
