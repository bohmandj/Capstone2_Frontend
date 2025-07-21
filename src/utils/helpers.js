
export const formatTimestamp = (isoString, useAmPm = true) => {
    const date = new Date(isoString);

    return date.toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: useAmPm
    });
}