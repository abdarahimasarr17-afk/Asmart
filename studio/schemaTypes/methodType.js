import {defineField, defineType} from 'sanity'

export const methodType = defineType({
  name: 'method',
  title: 'Section Notre Méthode',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Titre de la section',
      type: 'string',
    }),
    defineField({
      name: 'steps',
      title: 'Étapes (Ex: Identification, Analyse...)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'title', type: 'string', title: 'Titre de l\'étape'},
            {name: 'description', type: 'text', title: 'Description'}
          ]
        }
      ]
    })
  ],
})
