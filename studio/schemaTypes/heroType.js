import {defineField, defineType} from 'sanity'

export const heroType = defineType({
  name: 'hero',
  title: 'Section Accueil',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Titre Principal',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'heroImage',
      title: 'Image de fond (Optionnelle si vous gardez la couleur)',
      type: 'image',
      options: { hotspot: true }
    })
  ],
})
