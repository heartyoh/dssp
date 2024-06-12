import { Resolver, Mutation, Arg, Ctx, Directive } from 'type-graphql'
import { In } from 'typeorm'

import { createAttachment, deleteAttachmentsByRef } from '@things-factory/attachment-base'

import { BuildingInspection } from './building-inspection'
import { BuildingInspectionPatch } from './building-inspection-type'

@Resolver(BuildingInspection)
export class BuildingInspectionMutation {}
