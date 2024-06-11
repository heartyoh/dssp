import { Resolver, Mutation, Arg, Ctx, Directive } from 'type-graphql'
import { In } from 'typeorm'

import { createAttachment, deleteAttachmentsByRef } from '@things-factory/attachment-base'

import { BuildingLevel } from './building-level'
import { BuildingLevelPatch } from './building-level-type'

@Resolver(BuildingLevel)
export class BuildingLevelMutation {}
