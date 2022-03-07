import { render, screen } from '@testing-library/react'
import Game from './Game'

test('renders the Word for Word title', () => {
  render(<App />)
  const title = screen.getByText(/Word for Word/i)
  expect(title).toBeInTheDocument()
})
