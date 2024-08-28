import { getRepository } from '@things-factory/shell'

import { Project } from '../service/project/project'
import { Task, TaskType } from '../service/task/task'
import { TaskResource } from '../service/task-resource/task-resource'

export interface RawResource {
  type: string
  allocated: number
}

export interface RawTask {
  code: string
  title: string
  length?: string /* 1d, 2d, 3d, 4d, ... */
  startDate?: string /* YYYY-MM-DD */
  dependsOn?: string
  resources?: RawResource[]
  children?: RawTask[]
}

export async function importTasks(project: Project, tasks: RawTask[], context: ResolverContext) {
  const { tx } = context.state

  const taskRepository = getRepository(Task, tx)
  const taskResourceRepository = getRepository(TaskResource, tx)

  // 1. 기존 태스크와 리소스를 Soft Delete
  await taskRepository.update({ project }, { deletedAt: new Date() })
  await taskResourceRepository.update({ task: { project } }, { deletedAt: new Date() })

  // 2. 태스크 임포트
  const importTaskData = async (rawTask: RawTask, parentTaskId?: string) => {
    // 유효성 검사
    if (!rawTask.title || !rawTask.code || !rawTask.length) {
      throw new Error(`Task '${rawTask.code}' is missing required fields.`)
    }

    // 시작일, 종료일 계산
    let startDate: Date | undefined = rawTask.startDate ? new Date(rawTask.startDate) : undefined
    if (!startDate && rawTask.dependsOn) {
      const dependsOnTask = await taskRepository.findOne({ where: { code: rawTask.dependsOn, project } })
      if (!dependsOnTask || !dependsOnTask.endDate) {
        throw new Error(`Task '${rawTask.code}' depends on a task '${rawTask.dependsOn}' that doesn't have a valid end date.`)
      }
      startDate = new Date(dependsOnTask.endDate)
      startDate.setDate(startDate.getDate() + 1)
    }

    if (!startDate) {
      throw new Error(`Task '${rawTask.code}' must have either a start date or a valid dependency.`)
    }

    const lengthInDays = parseInt(rawTask.length.replace('d', ''), 10)
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + lengthInDays - 1)

    // 태스크 생성 및 저장
    const task = taskRepository.create({
      code: rawTask.code,
      name: rawTask.title,
      type: rawTask.children && rawTask.children.length > 0 ? TaskType.GROUP : TaskType.TASK,
      startDate,
      endDate,
      project,
      parentTaskId
    })

    await taskRepository.save(task)

    // 리소스 생성 및 저장
    if (rawTask.resources) {
      for (const resource of rawTask.resources) {
        const taskResource = taskResourceRepository.create({
          task,
          resource: { type: resource.type, allocated: resource.allocated } as any, // 'as any'는 Resource 타입으로 캐스팅을 위한 트릭
          quantity: resource.allocated
        })
        await taskResourceRepository.save(taskResource)
      }
    }

    // 자식 태스크 처리
    if (rawTask.children) {
      for (const childTask of rawTask.children) {
        await importTaskData(childTask, task.id)
      }
    }
  }

  // 루트 태스크들 임포트
  for (const rootTask of tasks) {
    await importTaskData(rootTask)
  }
}
