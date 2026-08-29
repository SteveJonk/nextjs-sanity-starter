import type {CSSProperties} from 'react'

/**
 * Shared inline styles for custom studio panels — the parts that any panel
 * needs (intro text, a button row, a notice).
 *
 * They use Sanity's own card variables, so a panel follows the theme the editor
 * picked. The fallbacks are the light values, in case a style is used outside a
 * Card where the variables are not set.
 */
export const styles = {
  intro: {color: 'var(--card-muted-fg-color, #6b7280)', lineHeight: 1.6},
  row: {display: 'flex', flexWrap: 'wrap' as const, gap: 12, margin: '20px 0'},
  button: {
    padding: '10px 18px',
    borderRadius: 4,
    border: '1px solid transparent',
    background: 'var(--card-focus-ring-color, #2276fc)',
    color: '#fff',
    fontSize: 14,
    cursor: 'pointer',
  },
  secondary: {
    padding: '10px 18px',
    borderRadius: 4,
    border: '1px solid var(--card-border-color, #c9cdd4)',
    background: 'transparent',
    color: 'inherit',
    fontSize: 14,
    cursor: 'pointer',
  },
  notice: {
    padding: 16,
    borderRadius: 4,
    border: '1px solid var(--card-border-color, #f0c000)',
    lineHeight: 1.6,
  },
} satisfies Record<string, CSSProperties>
