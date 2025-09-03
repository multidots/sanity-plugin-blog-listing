import { defineField, defineType } from 'sanity'

export const mdPostListing = defineType({
  name: 'mdPostListing',
  title: 'Post Listing',
  type: 'object',
  fields: [
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      options: {
        list: [
          { title: 'Grid', value: 'grid' },
          { title: 'List', value: 'list' },
        ],
        layout: 'radio',
      },
      initialValue: 'grid',
    }),
    defineField({
      name: 'postContent',
      title: 'Post Content',
      type: 'object',
      initialValue: {
        showContent: true,
      },
      fields: [
        defineField({
          name: 'showContent',
          title: 'Post Content',
          type: 'boolean',
          initialValue: true,
        }),
      ],
      options: { collapsible: true, collapsed: false },
    }),
    defineField({
      name: 'postMeta',
      title: 'Post Meta',
      type: 'object',
      initialValue: {
        showAuthor: true,
        showDate: true,
      },
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({
          name: 'displayAuthorName',
          title: 'Display Author Name',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'displayDate',
          title: 'Display Date',
          type: 'boolean',
          initialValue: true,
        }),
      ],
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'object',
      initialValue: {
        showFeaturedImage: true,
      },
      fields: [
        defineField({
          name: 'showFeaturedImage',
          title: 'Display Featured Image',
          type: 'boolean',
          initialValue: true,
        }),
      ],
      options: { collapsible: true, collapsed: false },
    }),
    defineField({
      name: 'postCategory',
      title: 'Post Category',
      type: 'object',
      initialValue: {
        showCategory: true,
      },
      fields: [
        defineField({
          name: 'showCategory',
          title: 'Display Category',
          type: 'boolean',
          initialValue: true,
        }),
      ],
      options: { collapsible: true, collapsed: false },
    }),
    defineField({
      name: 'sortingAndFiltering',
      title: 'Sorting and filtering',
      type: 'object',
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({
          name: 'orderBy',
          title: 'Order By',
          type: 'string',
          options: {
            list: [
              { title: 'Newest to Oldest', value: 'newestToOldest' },
              { title: 'Oldest to Newest', value: 'oldestToNewest' },
              { title: 'A->Z', value: 'AtoZ' },
              { title: 'Z->A', value: 'ZtoA' },
            ],
            layout: 'dropdown',
          },
          initialValue: 'newestToOldest',
        }),

        defineField({
          name: 'displayPostBy',
          title: 'Display Posts By',
          type: 'string',
          options: {
            list: [
              { title: 'Category', value: 'category' },
              { title: 'Author', value: 'author' },
              { title: 'Select Manually', value: 'selectManually' },
              { title: 'All Posts', value: 'allPosts' },
            ],
            layout: 'radio',
          },
          initialValue: 'allPosts',
        }),
        defineField({
          name: 'filterByCategory',
          title: 'Filter by Categories',
          type: 'array',
          of: [
            {
              type: 'reference',
              to: [{ type: 'mdPostCategory' }],
            },
          ],
          description: 'Only show posts from selected categories',
          hidden: ({ parent }) => parent?.displayPostBy !== 'category',
        }),
        defineField({
          name: 'filterByAuthor',
          title: 'Filter by Author',
          type: 'array',
          of: [{ type: 'reference', to: [{ type: 'mdPostAuthor' }] }],
          description: 'Only show posts from selected authors',
          hidden: ({ parent }) => parent?.displayPostBy !== 'author',
        }),
        defineField({
          name: 'selectPosts',
          title: 'Select Specific Posts',
          type: 'array',
          of: [
            {
              type: 'reference',
              to: [{ type: 'mdPost' }],
            },
          ],
          description: 'If specific posts are selected, only those will be shown',
          hidden: ({ parent }) => parent?.displayPostBy !== 'selectManually',
        }),
        defineField({
          name: 'paginationType',
          title: 'Pagination Type',
          type: 'string',
          options: {
            list: [
              { title: 'None', value: 'none' },
              { title: 'Load More', value: 'loadMore' },
              { title: 'Pagination', value: 'pagination' },
            ],
            layout: 'radio',
          },
          initialValue: 'none',
        }),
        defineField({
          name: 'numberOfPosts',
          title: 'Number of Posts',
          type: 'number',
          initialValue: 6,
          description: 'Number of posts to display per page. Default is 6',
          validation: (Rule) => Rule.min(1).max(50),
          hidden: ({ parent }) => parent?.paginationType === 'none',
        }),
      ],
    }),
  ],
  preview: {
    select: {
      layout: 'layout',
      count: 'sortingAndFiltering.numberOfPosts',
    },
    prepare({ layout, count }) {
      return {
        title: `Post Listing (${layout})`,
        subtitle: `${count ?? 0} posts`,
      }
    },
  },
})
