/** Returns the current calendar year for copyright notices (updates automatically). */
export function getCopyrightYear(): number {
  return new Date().getFullYear();
}

export function formatCopyrightNotice(
  holder = "Sabary tours",
  startYear?: number
): string {
  const current = getCopyrightYear();
  if (startYear && startYear < current) {
    return `Copyright © ${startYear}–${current} ${holder}. All rights reserved.`;
  }
  return `Copyright © ${current} ${holder}. All rights reserved.`;
}
