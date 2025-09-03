import {defineArrayMember, defineType} from 'sanity'

export const mdblockContent = defineType({
  name: 'mdblockContent',
  title: 'Block Content',
  type: 'array',
  of: [
    defineArrayMember({type: 'block'}),
    defineArrayMember({
      type: 'image',
      options: {hotspot: true},
    }),
  ],
})


