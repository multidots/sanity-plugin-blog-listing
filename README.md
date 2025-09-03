# Sanity Plugin Blog Listing

Powerful blog listing for Sanity Studio v3 with an optional ready-made React (Next.js) client component. Posts, categories, and authors in Studio and render them in your site with grid/list layout, sorting, filtering, pagination, and more.

## Features

- **Configurable listing**:
  - Layout options: Switch between grid or list view
  - Featured image: Show/hide and control image sizing
  - Meta information: Display/hide author name and publish date
  - Category display: Show/hide post categories
  - Content preview: Toggle excerpt visibility
  - Customizable styling: Apply your own CSS classes and styles

- **Sorting & filtering**:
  - Date-based sorting: Newest to oldest or oldest to newest
  - Alphabetical sorting: A to Z or Z to A
  - Category filtering: Show posts from specific categories
  - Author filtering: Display posts by selected authors
  - Manual selection: Hand-pick specific posts to display
  - Post limit: Control number of posts shown
  
- **Pagination**:
  - No pagination: Show all posts at once
  - Load more: Add button to load additional posts
  - Numbered pagination: Navigate through pages with numbered controls
  - Customizable items per page

- **Client component**: 
  - Ready-to-use `PostListingWrapper` React component
  - Built for Next.js applications
  - Fully typed with TypeScript
  - Handles data fetching from Sanity

- **Schemas included**:
  - `mdPost`: Complete blog post document schema with title, slug, author reference, featured image, category references, publish date, excerpt and body content
  - `mdPostCategory`: Category document schema with title, slug and description
  - `mdPostAuthor`: Author document schema with name, slug, profile image and biography
  - `mdPostListing`: Configurable object schema for customizing how posts are displayed


## Installation

```sh
npm install @multidots/sanity-plugin-blog-listing
```

Peer requirements in your frontend (if using the React component):

```sh
npm install @sanity/client @sanity/image-url
```

## Add to Sanity Studio

Add the plugin in `sanity.config.ts` (or .js):

```ts
import {defineConfig} from 'sanity'
import {MDBlogListing} from '@multidots/sanity-plugin-blog-listing'

export default defineConfig({
  // ...your studio config
  plugins: [MDBlogListing()],
})
```

Example: add a listing section to a Page schema

```ts
// page.ts
import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    defineField({name: 'title', type: 'string'}),
    defineField({
      name: 'blogListing',
      type: 'mdPostListing',
      title: 'Blog Listing',
      description: 'Display a list of blog posts.',
    }),
  ],
})
```

### `mdPostListing` config shape (frontend)

```ts
type MdPostListingConfig = {
  layout?: 'grid' | 'list'
  postContent?: {showContent?: boolean}
  postMeta?: {displayAuthorName?: boolean; displayDate?: boolean}
  featuredImage?: {showFeaturedImage?: boolean}
  postCategory?: {showCategory?: boolean}
  sortingAndFiltering?: {
    orderBy?: 'newestToOldest' | 'oldestToNewest' | 'AtoZ' | 'ZtoA'
    displayPostBy?: 'category' | 'author' | 'selectManually' | 'allPosts'
    filterByCategory?: Array<{_ref?: string; _id?: string}>
    filterByAuthor?: Array<{_ref?: string; _id?: string}>
    selectPosts?: Array<{_ref?: string; _id?: string}>
    numberOfPosts?: number
    paginationType?: 'none' | 'loadMore' | 'pagination'
  }
}
```

## Frontend usage (Next.js)

Recommended approach: create a small Client Component wrapper, then render it from a Server Component page.

Client wrapper (ensure it runs on the client):

```tsx
'use client'
import { PostListingWrapper } from '@multidots/sanity-plugin-blog-listing/client'
import type { MdPostListing } from '@/sanity/types'

export default function PostListing({ config }: { config?: MdPostListing | null }) {
  return <PostListingWrapper config={config} />
}
```

Server page usage:

```tsx
const getPage = async (params: RouteProps['params']) =>
  sanityFetch({
    query: PAGE_QUERY,
    params,
  })

export default async function Page({ params }: RouteProps) {
  const { data: page } = await getPage(params)

  return (
    <>
      <PostListing config={page?.blogListing} />
    </>
  )
}
```
Sample page query:
```ts
const PAGE_QUERY = defineQuery(`*[_type == "page" && slug.current == $slug][0]{
  ...,
  title,
  blogListing
}`)
```

Environment variables required:

- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`

## Styling

You can style the plugin using the following CSS classes:

- `post-listing`
- `post-card`
- `post-content`
- `post-title`
- `post-meta`
- `post-category`
- `load-more-btn`
- `pagination-btn`

## Screenshots

### Backend Configuration
![Backend Settings](https://raw.githubusercontent.com/benazeerhassan1909/sanity-blog-listing-plugin/main/public/backend-settings.png)
![Backend Settings](https://raw.githubusercontent.com/benazeerhassan1909/sanity-blog-listing-plugin/main/public/Backend-setting.png)

### Frontend Display Options
#### Grid Layout
![Grid Layout with Load More](https://raw.githubusercontent.com/benazeerhassan1909/sanity-blog-listing-plugin/main/public/grid-loadmore.png)
![Grid Layout with Pagination](https://raw.githubusercontent.com/benazeerhassan1909/sanity-blog-listing-plugin/main/public/grid-pagination.png)

#### List Layout
![List Layout with Load More](https://raw.githubusercontent.com/benazeerhassan1909/sanity-blog-listing-plugin/main/public/list-loadmore.png)
![List Layout with Pagination](https://raw.githubusercontent.com/benazeerhassan1909/sanity-blog-listing-plugin/main/public/list-pagination.png)

## Troubleshooting

- **Error: defineLive can only be used in React Server Components**
  - Ensure you import the wrapper from `sanity-plugin-blog-listing/client`.
  - Do not import your own `defineLive` utilities (from next-sanity) into client components. Keep those in server files (e.g. `live.server.ts`) and only use them in Server Components.

- **No posts found**
  - Create some `mdPost` documents and assign categories/authors as needed.


## Exports

- Studio plugin: `MDBlogListing` from `sanity-plugin-blog-listing`
- Client component entry: `PostListingWrapper` (and its types) from `sanity-plugin-blog-listing/client`

## Develop & test

This plugin uses [@sanity/plugin-kit](https://github.com/sanity-io/plugin-kit) for build & watch scripts.

Local development tips:

- `npm run link-watch` or `npm run watch` to develop against a local Studio
- Publish with `npm publish` (build runs on `prepublishOnly`)

## License

[MIT](LICENSE) © Multidots
