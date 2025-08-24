import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import MarkdownIt from 'markdown-it'

const postsDirectory = path.join(process.cwd(), 'app/blog/posts')

export function getPostSlugs() {
  return fs
    .readdirSync(postsDirectory)
  .filter((name) => fs.statSync(path.join(postsDirectory, name)).isDirectory())
}

const md = new MarkdownIt()

export async function getPostBySlug(slug: string) {
  const fullPath = path.join(postsDirectory, slug, 'page.mdx')
  const fileContents = await fs.promises.readFile(fullPath, 'utf8')
  const { data, content } = matter(fileContents)
  const htmlContent = md.render(content)
  return {
    slug,
    ...data,
    content: htmlContent,
  } as any
}

export async function getAllPosts() {
  const slugs = getPostSlugs()
  const posts = await Promise.all(slugs.map((slug) => getPostBySlug(slug)))
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
