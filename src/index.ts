import {definePlugin} from 'sanity'

import {mdblockContent} from './schemas/mdblockContent'
import {mdPost} from './schemas/mdPost'
import {mdPostAuthor} from './schemas/mdPostAuthor'
import {mdPostCategory} from './schemas/mdPostCategory'
import {mdPostListing} from './schemas/mdpostListing'
/**
 * Sanity plugin that registers blog post, author, category, and listing schemas.
 * @public
 */
export const MDBlogListing = definePlugin(() => {
  return {
    name: 'sanity-plugin-blog-listing',
    schema: {
      types: [mdblockContent, mdPost, mdPostCategory, mdPostAuthor, mdPostListing],
    },
  }
})
