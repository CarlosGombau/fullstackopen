// Logs in with a username and a password
const loginWith = async (page, username, password) => {
  await page.getByTestId('username').fill(username)
  await page.getByTestId('password').fill(password)
  await page.getByRole('button', { name: 'login' }).click()
}

// Creates a blog using the form and waits until it appears in the list
const createBlog = async (page, { title, author, url }) => {
  await page.getByRole('button', { name: 'create new blog', exact: true }).click()
  await page.getByPlaceholder('title').fill(title)
  await page.getByPlaceholder('author').fill(author)
  await page.getByPlaceholder('url').fill(url)
  await page.getByRole('button', { name: 'create', exact: true }).click()

  await page.locator('.blog').filter({ hasText: title }).waitFor()
}

// Opens the details of a blog and clicks its like button "times" times
const likeBlog = async (page, title, times) => {
  const blog = page.locator('.blog').filter({ hasText: title })

  await blog.getByRole('button', { name: 'view', exact: true }).click()

  for (let i = 1; i <= times; i++) {
    await blog.getByRole('button', { name: 'like', exact: true }).click()
    // Wait until the new number appears before the next click
    await blog.getByText(`likes ${i}`).waitFor()
  }
}

module.exports = { loginWith, createBlog, likeBlog }