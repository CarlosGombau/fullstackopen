import { test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BlogForm from './BlogForm'

test('calls createBlog with the right details when a blog is created', async () => {
  const createBlog = vi.fn()
  const user = userEvent.setup()

  render(<BlogForm createBlog={createBlog} />)

  // Write in the three fields
  await user.type(screen.getByPlaceholderText('title'), 'Testing forms')
  await user.type(screen.getByPlaceholderText('author'), 'Form Author')
  await user.type(screen.getByPlaceholderText('url'), 'https://example.com/forms')

  // Click the create button
  await user.click(screen.getByRole('button', { name: 'create' }))

  // The handler was called once, with the data we wrote
  expect(createBlog).toHaveBeenCalledTimes(1)
  expect(createBlog).toHaveBeenCalledWith({
    title: 'Testing forms',
    author: 'Form Author',
    url: 'https://example.com/forms'
  })
})