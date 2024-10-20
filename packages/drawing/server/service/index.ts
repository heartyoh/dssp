/* EXPORT ENTITY TYPES */

/* IMPORT ENTITIES AND RESOLVERS */
import { resolvers as PDFDrawingResolvers } from './pdf-drawing'

export const entities = [
  /* ENTITIES */
]

export const schema = {
  resolverClasses: [
    /* RESOLVER CLASSES */
    ...PDFDrawingResolvers
  ]
}
