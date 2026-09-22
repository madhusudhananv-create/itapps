/**
 * Utility function to get color for AI adoption score chips
 * @param score - The AI adoption score value
 * @returns Hex color code for the score
 */
export const getScoreColor = (score: string): string => {
  switch (score) {
    case '0':
      return '#dc3545'; // Red for no adoption
    case '1':
      return '#fd7e14'; // Orange for basic awareness
    case '2':
      return '#ffc107'; // Yellow for initial implementation
    case '3':
      return '#20c997'; // Teal for partial adoption
    case '4':
      return '#198754'; // Green for full adoption
    case '5':
      return '#6f42c1'; // Purple for optimized/automated
    case 'N/A':
      return '#6c757d'; // Gray for not applicable
    default:
      return '#6c757d';
  }
};
