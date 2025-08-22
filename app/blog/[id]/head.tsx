import { blogPosts } from '../posts'

export default function Head({ params }: { params: { id: string } }) {
  const post = blogPosts.find(p => p.id === parseInt(params.id))
  const title = post ? `${post.title} | Gary Lee McCullouch Jr.` : 'Post Not Found | Gary Lee McCullouch Jr.'
  const description = post ? post.excerpt : 'The requested article could not be found.'
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content="/og-image.svg" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content="/og-image.svg" />
    </>
  )
}

