const { test, expect, beforeEach, describe } = require('@playwright/test')
const { loginWith, createBlog, likeBlog } = require('./helper')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    // Empty the database and create two users
    await request.post('/api/testing/reset')
    await request.post('/api/users', {
      data: { name: 'Test User', username: 'tester', password: 'secret123' }
    })
    await request.post('/api/users', {
      data: { name: 'Other User', username: 'other', password: 'secret456' }
    })

    await page.goto('/')
  })

  // 5.17
  test('Login form is shown', async ({ page }) => {
    await expect(page.getByText('Log in to application')).toBeVisible()
    await expect(page.getByTestId('username')).toBeVisible()
    await expect(page.getByTestId('password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'login' })).toBeVisible()
  })

  // 5.18
  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, 'tester', 'secret123')

      await expect(page.getByText('Test User logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await loginWith(page, 'tester', 'wrongpassword')

      const errorMessage = page.getByText('wrong username or password')
      await expect(errorMessage).toBeVisible()
      await expect(errorMessage).toHaveCSS('color', 'rgb(255, 0, 0)')

      await expect(page.getByText('Test User logged in')).not.toBeVisible()
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'tester', 'secret123')
    })

    // 5.19
    test('a new blog can be created', async ({ page }) => {
      await createBlog(page, {
        title: 'A blog created by Playwright',
        author: 'Playwright',
        url: 'https://playwright.dev'
      })

      await expect(
        page.locator('.blog').filter({ hasText: 'A blog created by Playwright' })
      ).toBeVisible()
      await expect(
        page.getByText('a new blog A blog created by Playwright by Playwright added')
      ).toBeVisible()
    })

    describe('and a blog exists', () => {
      beforeEach(async ({ page }) => {
        await createBlog(page, {
          title: 'Blog to like and delete',
          author: 'Some Author',
          url: 'https://example.com/blog'
        })
      })

      // 5.20
      test('a blog can be liked', async ({ page }) => {
        const blog = page.locator('.blog').filter({ hasText: 'Blog to like and delete' })

        await blog.getByRole('button', { name: 'view', exact: true }).click()
        await expect(blog.getByText('likes 0')).toBeVisible()

        await blog.getByRole('button', { name: 'like', exact: true }).click()
        await expect(blog.getByText('likes 1')).toBeVisible()
      })

      // 5.21
      test('the user who created a blog can delete it', async ({ page }) => {
        // The delete operation asks for confirmation: accept the dialog
        page.once('dialog', async (dialog) => {
          await dialog.accept()
        })

        const blog = page.locator('.blog').filter({ hasText: 'Blog to like and delete' })

        await blog.getByRole('button', { name: 'view', exact: true }).click()
        await blog.getByRole('button', { name: 'remove', exact: true }).click()

        await expect(
          page.locator('.blog').filter({ hasText: 'Blog to like and delete' })
        ).toHaveCount(0)
      })

      // 5.22
      test('only the creator sees the remove button', async ({ page }) => {
        const blog = page.locator('.blog').filter({ hasText: 'Blog to like and delete' })

        // The creator sees the button
        await blog.getByRole('button', { name: 'view', exact: true }).click()
        await expect(
          blog.getByRole('button', { name: 'remove', exact: true })
        ).toBeVisible()

        // Another user does not see it
        await page.getByRole('button', { name: 'logout' }).click()
        await loginWith(page, 'other', 'secret456')

        const sameBlog = page.locator('.blog').filter({ hasText: 'Blog to like and delete' })
        await sameBlog.getByRole('button', { name: 'view', exact: true }).click()

        await expect(sameBlog.getByText('likes 0')).toBeVisible() // details are open
        await expect(
          sameBlog.getByRole('button', { name: 'remove', exact: true })
        ).toHaveCount(0)
      })
    })

    // 5.23
    test('blogs are ordered by likes, the most liked first', async ({ page }) => {
      await createBlog(page, { title: 'Blog A', author: 'Author', url: 'https://example.com/a' })
      await createBlog(page, { title: 'Blog B', author: 'Author', url: 'https://example.com/b' })
      await createBlog(page, { title: 'Blog C', author: 'Author', url: 'https://example.com/c' })

      // A: 0 likes, B: 2 likes, C: 1 like  ->  the order must be B, C, A
      await likeBlog(page, 'Blog B', 2)
      await likeBlog(page, 'Blog C', 1)

      const blogs = page.locator('.blog')
      await expect(blogs).toHaveCount(3)
      await expect(blogs.nth(0)).toContainText('Blog B')
      await expect(blogs.nth(1)).toContainText('Blog C')
      await expect(blogs.nth(2)).toContainText('Blog A')
    })
  })
})