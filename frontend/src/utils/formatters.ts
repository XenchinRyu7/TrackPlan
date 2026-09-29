export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatDateTime(isoString: string): string {
  if (!isoString) return '-';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return isoString;
  }
}

export function formatSalary(min: number, max: number, currency: string = 'IDR'): string {
  if (!min && !max) return '';
  
  const fmt = (val: number) => {
    if (currency === 'IDR') {
      if (val >= 1_000_000_000) {
        return (val / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + ' M';
      }
      if (val >= 1_000_000) {
        return (val / 1_000_000).toFixed(1).replace(/\.0$/, '') + ' jt';
      }
      if (val >= 1_000) {
        return (val / 1_000).toFixed(0) + 'k';
      }
      return val.toLocaleString();
    }
    return val.toLocaleString();
  };

  if (min > 0 && max > 0) {
    if (min === max) {
      return `${currency} ${fmt(min)}`;
    }
    return `${currency} ${fmt(min)} - ${fmt(max)}`;
  } else if (min > 0) {
    return `>= ${currency} ${fmt(min)}`;
  } else if (max > 0) {
    return `<= ${currency} ${fmt(max)}`;
  }
  return '';
}
