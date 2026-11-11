import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'

// The blog we use in all the tests
const blog = {
  id: '1',
  title: 'Testing React components',
  author: 'Test Author',
  url: 'https://example.com/testing',
  likes: 7,
  user: { id: 'u1', username: 'carlos', name: 'Carlos' }
}

describe('<Blog />', () => {
  // 5.13
  test('renders the title and the author, but not the url or the likes', () => {
    const { container } = render(
      <Blog
        blog={blog}
        handleLike={vi.fn()}
        handleDelete={vi.fn()}
        showDelete={false}
      />
    )

    const summary = container.querySelector('.blog-summary')
    expect(summary).toHaveTextContent('Testing React components')
    expect(summary).toHaveTextContent('Test Author')

    // The details are not rendered at all
    expect(container.querySelector('.blog-details')).toBeNull()
    expect(screen.queryByText('https://example.com/testing')).toBeNull()
    expect(screen.queryByText(/likes/)).toBeNull()
  })

  // 5.14
  test('shows the url and the likes after clicking the view button', async () => {
    const user = userEvent.setup()

    const { container } = render(
      <Blog
        blog={blog}
        handleLike={vi.fn()}
        handleDelete={vi.fn()}
        showDelete={false}
      />
    )

    await user.click(screen.getByText('view'))

    const details = container.querySelector('.blog-details')
    expect(details).toBeInTheDocument()
    expect(details).toHaveTextContent('https://example.com/testing')
    expect(details).toHaveTextContent('likes 7')
  })

  // 5.15
  test('calls the like handler twice if the like button is clicked twice', async () => {
    const mockHandler = vi.fn()
    const user = userEvent.setup()

    render(
      <Blog
        blog={blog}
        handleLike={mockHandler}
        handleDelete={vi.fn()}
        showDelete={false}
      />
    )

    // The like button is only visible when the details are open
    await user.click(screen.getByText('view'))

    const likeButton = screen.getByText('like')
    await user.click(likeButton)
    await user.click(likeButton)

    expect(mockHandler).toHaveBeenCalledTimes(2)
  })
})