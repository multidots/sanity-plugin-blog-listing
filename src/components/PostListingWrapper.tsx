'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

/** @public */
export interface Post {
  _id: string
  title: string
  slug: { current: string }
  featuredImage?: (SanityImageSource & { alt?: string })
  excerpt?: string
  publishedAt?: string
  author?: {
    name: string
    image?: SanityImageSource
  }
  categories?: Array<{
    _id: string
    title: string
  }>
}

/** @public */
export interface MdPostListingConfig {
  layout?: 'grid' | 'list'
  postContent?: {
    showContent?: boolean
  }
  postMeta?: {
    displayAuthorName?: boolean
    displayDate?: boolean
  }
  featuredImage?: {
    showFeaturedImage?: boolean
  }
  postCategory?: {
    showCategory?: boolean
  }
  sortingAndFiltering?: {
    orderBy?: 'newestToOldest' | 'oldestToNewest' | 'AtoZ' | 'ZtoA'
    displayPostBy?: 'category' | 'author' | 'selectManually' | 'allPosts'
    filterByCategory?: Array<{ _ref?: string; _id?: string; slug?: { current: string } }>
    filterByAuthor?: Array<{ _ref?: string; _id?: string }>
    selectPosts?: Array<{ _ref?: string; _id?: string }>
    numberOfPosts?: number
    paginationType?: 'none' | 'loadMore' | 'pagination'
  }
}

/** @public */
export interface PostListingProps {
  config?: MdPostListingConfig | null
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2023-05-01',
  useCdn: true,
})

const builder = imageUrlBuilder(client)
const urlFor = (source: SanityImageSource) => builder.image(source)

/**
 * Client-side post listing component for rendering posts based on mdPostListing config.
 * @public
 */
export function PostListingWrapper({ config }: PostListingProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPosts, setTotalPosts] = useState(0)

  const effectiveLayout = config?.layout ?? 'grid'
  const effectivePaginationType = config?.sortingAndFiltering?.paginationType ?? 'none'
  const effectiveLimit = effectivePaginationType === 'none' ? undefined : config?.sortingAndFiltering?.numberOfPosts ?? 6
  const effectiveShowThumbnail = config?.featuredImage?.showFeaturedImage ?? true
  const effectiveShowCategory = config?.postCategory?.showCategory ?? true
  const effectiveShowContent = config?.postContent?.showContent ?? true
  const effectiveDisplayPostBy = config?.sortingAndFiltering?.displayPostBy ?? 'allPosts'
  const displayAuthorName = config?.postMeta?.displayAuthorName ?? true
  const displayDate = config?.postMeta?.displayDate ?? true
  const orderByVal = config?.sortingAndFiltering?.orderBy
  const orderClause =
    orderByVal === 'oldestToNewest'
      ? 'coalesce(publishedAt, _createdAt) asc'
      : orderByVal === 'AtoZ'
        ? 'title asc'
        : orderByVal === 'ZtoA'
          ? 'title desc'
          : 'coalesce(publishedAt, _createdAt) desc'

  const effectiveCategoryIds = (
    config?.sortingAndFiltering?.filterByCategory?.map((c) => (c as any)?._ref || (c as any)?._id) ?? []
  ).filter(Boolean)
  const effectiveAuthorIds = (
    config?.sortingAndFiltering?.filterByAuthor?.map((a) => (a as any)?._ref || (a as any)?._id) ?? []
  ).filter(Boolean)
  const effectiveSelectPosts = (
    config?.sortingAndFiltering?.selectPosts?.map((p) => (p as any)?._ref || (p as any)?._id) ?? []
  ).filter(Boolean)

  const offset = effectiveLimit ? (currentPage - 1) * effectiveLimit : 0
  const showPagination = effectivePaginationType === 'pagination'
  const showLoadMore = effectivePaginationType === 'loadMore'

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)
      try {
        let baseQuery = ''
        let totalQuery = ''
        let finalQuery = ''

        if (effectiveDisplayPostBy === 'selectManually' && effectiveSelectPosts?.length) {
          const ids = JSON.stringify(effectiveSelectPosts)
          baseQuery = `*[_type == "mdPost" && _id in ${ids}]`
          totalQuery = `count(*[_type == "mdPost" && _id in ${ids}])`
        } else if (effectiveDisplayPostBy === 'category' && effectiveCategoryIds?.length) {
          const cats = JSON.stringify(effectiveCategoryIds)
          baseQuery = `*[_type == "mdPost" && count(categories[@._ref in ${cats}]) > 0]`
          totalQuery = `count(*[_type == "mdPost" && count(categories[@._ref in ${cats}]) > 0])`
        } else if (effectiveDisplayPostBy === 'author' && effectiveAuthorIds?.length) {
          const authors = JSON.stringify(effectiveAuthorIds)
          baseQuery = `*[_type == "mdPost" && author._ref in ${authors}]`
          totalQuery = `count(*[_type == "mdPost" && author._ref in ${authors}])`
        } else {
          baseQuery = `*[_type == "mdPost"]`
          totalQuery = `count(*[_type == "mdPost"])`
        }

        const slice = effectiveLimit ? `[${offset}...${offset + effectiveLimit}]` : ''
        finalQuery = `${baseQuery} | order(${orderClause})${slice}{
          _id,
          title,
          slug,
          featuredImage,
          excerpt,
          publishedAt,
          author->{
            name,
            image
          },
          categories[]->{
            _id,
            title
          }
        }`

        const [fetchedPosts, total] = await Promise.all([
          client.fetch(finalQuery),
          client.fetch(totalQuery),
        ])

        if (effectivePaginationType === 'loadMore' && currentPage > 1) {
          setPosts((prev) => [...prev, ...fetchedPosts])
        } else {
          setPosts(fetchedPosts)
        }

        setTotalPosts(total)
      } catch (error) {
        console.error('Error loading posts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    effectiveLimit,
    currentPage,
    effectiveDisplayPostBy,
    JSON.stringify(effectiveCategoryIds),
    JSON.stringify(effectiveAuthorIds),
    JSON.stringify(effectiveSelectPosts),
    orderClause,
    effectivePaginationType,
  ])

  const totalPages = effectiveLimit ? Math.ceil(totalPosts / effectiveLimit) : 1

  const handleLoadMore = () => setCurrentPage((prev) => prev + 1)
  const handlePageClick = (page: number) => setCurrentPage(page)

  if (loading && posts.length === 0) return <div>Loading...</div>
  if (!posts.length) return <p>No posts found</p>

  return (
    <>
      <div className={`md-post-listing ${effectiveLayout}`}>
        {posts.map((post) => (
          <div key={post._id} className={`md-post-card ${effectiveLayout}`}>
            {effectiveShowThumbnail && post.featuredImage && (
              <img
                alt={post.featuredImage.alt || post.title}
                src={urlFor(post.featuredImage).width(300).height(200).url()}
              />
            )}
            <div className="md-post-content">
              <h3 className="md-post-title">{post.title}</h3>

              {(displayAuthorName || displayDate) && (
                <div className="md-post-meta">
                  {displayAuthorName && post.author?.name && <span>By {post.author.name}</span>}
                  {displayDate && post.publishedAt && (
                    <span style={{ marginLeft: 10 }}>
                      {new Date(post.publishedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}

              {effectiveShowCategory && post.categories?.length && (
                <p className="md-post-category">{post.categories.map((c) => c.title).join(', ')}</p>
              )}

              {effectiveShowContent && post.excerpt && <p className="md-post-excerpt">{post.excerpt}</p>}
            </div>
          </div>
        ))}
      </div>

      {showLoadMore && posts.length < totalPosts && (
        <div style={{ textAlign: 'center', marginTop: '1rem' }} className='md-load-more-btn'>
          <button
            onClick={handleLoadMore}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#ddd'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#eee'
            }}
          >
            Load More
          </button>
        </div>
      )}

      {showPagination && totalPages > 1 && (
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }} className='md-pagination-btn'>
          {Array.from({ length: totalPages }, (_, i) => {
            const pageNumber = i + 1
            const isActive = currentPage === pageNumber

            return (
              <button
                key={i}
                onClick={() => handlePageClick(pageNumber)}
                disabled={isActive}
                style={{
                  margin: '0 0.25rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: isActive ? '#000' : '#eee',
                  color: isActive ? '#fff' : '#333',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: isActive ? 'default' : 'pointer',
                  opacity: isActive ? 0.7 : 1,
                }}
              >
                {pageNumber}
              </button>
            )
          })}
        </div>
      )}
      <style>{`
        .md-post-listing {
          display: grid;
          gap: 1.5rem;
          max-width: 1200px;
          margin: 50px auto;
        }

        .md-post-card {
          border: 1px solid #ddd;
          padding: 1rem;
          border-radius: 8px;
          background-color: #fff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
          transition: box-shadow 0.3s ease;
        }

        .md-post-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .md-post-card img {
          max-width: 100%;
          height: auto;
          border-radius: 6px;
          object-fit: cover;
        }

        .md-post-content {
          margin-top: 1rem;
        }

        .md-post-title h3{
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
          color: green!important;
        }

        .md-post-meta {
          font-size: 0.875rem;
          color: #666;
          margin-bottom: 0.5rem;
        }

        .md-post-category {
          font-size: 0.8rem;
          color: #999;
          font-style: italic;
          margin-bottom: 0.5rem;
        }

        .md-post-listing.grid {
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        }

        .md-post-listing.list {
          display: flex;
          flex-direction: column;
        }

        .md-post-card.list {
          display: flex;
          gap: 1rem;
        }

        .md-post-card.list img {
          width: 200px;
          height: 140px;
          flex-shrink: 0;
        }

        .md-post-card.list .post-content {
          flex: 1;
          margin-top: 0;
        }
       .md-load-more-btn button{
          padding: 0.5rem 1rem;
          background-color: #eee;
          color: #333; 
          border-radius: 4px;
          border: none!important;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s ease;
          margin-bottom: 40px;
          }
          .md-pagination-btn{
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 40px;
          }
      `}</style>
    </>
  )
}


