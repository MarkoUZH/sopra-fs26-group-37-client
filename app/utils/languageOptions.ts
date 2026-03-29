import ISO6391 from 'iso-639-1';

export const getLanguageOptions = () => {
    const codes = ISO6391.getAllCodes();

    return codes.map(code => ({
        label: ISO6391.getNativeName(code),
        value: code,
    })).sort((a, b) => a.label.localeCompare(b.label));
};