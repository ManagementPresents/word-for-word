import { render, screen } from '@testing-library/react'
import Game from './Game'

test('renders the War of the Wordles title', () => {
  render(<App />)
  const title = screen.getByText(/War of the Wordles/i)
  expect(title).toBeInTheDocument()
})
