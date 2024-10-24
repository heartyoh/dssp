import { getRepository } from '@things-factory/shell'

import { Project } from '../service/project/project'
import { Task, TaskType } from '../service/task/task'
import { TaskResource } from '../service/task-resource/task-resource'
import { Resource } from '../service/resource/resource'
import { RawTask } from './types'

function excelSerialToJSDate(serial) {
  const excelEpoch = new Date(1899, 11, 30) // Excel epoch (30th December 1899)
  const days = Math.floor(serial) // Get the number of days
  const milliseconds = (serial - days) * 86400 * 1000 // Convert the fractional day part to milliseconds

  const jsDate = new Date(excelEpoch.getTime() + days * 86400 * 1000 + milliseconds)
  return jsDate
}

export async function importTasks(project: Project, tasks: RawTask[], context: ResolverContext) {
  const { domain, user, tx } = context.state

  const taskRepository = getRepository(Task, tx)
  const resourceRepository = getRepository(Resource, tx)
  const taskResourceRepository = getRepository(TaskResource, tx)

  // 1. 기존 태스크와 리소스를 Soft Delete
  await taskRepository.softDelete({ project: { id: project.id } })

  // 2. 태스크 임포트
  const importTaskData = async (rawTask: RawTask, parent?: Task) => {
    if (rawTask.children && rawTask.children.length > 0) {
      rawTask.type = TaskType.GROUP
    } else {
      rawTask.type = TaskType.TASK
    }

    // 유효성 검사
    if (!rawTask.title || !rawTask.code || (rawTask.type == TaskType.TASK && (rawTask.duration ?? null) === null)) {
      throw new Error(`Task '${rawTask.code}' is missing required fields.`)
    }

    if (rawTask.type == TaskType.TASK) {
      // 시작일, 종료일 계산
      var startDate: Date
      if (typeof rawTask.startDate === 'number') {
        startDate = excelSerialToJSDate(rawTask.startDate) // Convert Excel serial number to JS date
      }

      var endDate: Date
      if (!startDate && rawTask.dependsOn) {
        const dependsOnTask = await taskRepository.findOne({ where: { code: rawTask.dependsOn, project: { id: project.id } } })
        if (dependsOnTask && dependsOnTask.endDate) {
          startDate = new Date(dependsOnTask.endDate)
          startDate.setDate(startDate.getDate() + 1)
        } else {
          // TODO handler error
          // throw new Error(`Task '${rawTask.code}' depends on a task '${rawTask.dependsOn}' that doesn't have a valid end date.`)
        }
      }

      if (!startDate) {
        throw new Error(`Task '${rawTask.code}' must have either a start date or a valid dependency.`)
      }

      const duration = rawTask.duration
      endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + duration - 1)
    }

    // 태스크 생성 및 저장
    var task: Task = await taskRepository.save({
      code: rawTask.code,
      name: rawTask.title,
      type: rawTask.type,
      startDate,
      endDate,
      project,
      parent,
      duration: rawTask.duration,
      dependsOn: rawTask.dependsOn,
      progress: rawTask.progress,
      tags: rawTask.tags,
      updater: user,
      creator: user
    })

    // 리소스 생성 및 저장
    if (rawTask.resources) {
      for (const resource of rawTask.resources) {
        const resourceType = await resourceRepository.findOne({ where: { domain: { id: domain.id }, name: resource.type } })
        if (resourceType) {
          await taskResourceRepository.save({
            task,
            resource: resourceType,
            quantity: resource.allocated
          })
        } else {
          throw new Error(`unknown resource type: ${resource.type}`)
        }
      }
    }

    // 자식 태스크 처리
    if (rawTask.children && rawTask.children.length > 0) {
      let lastEndDate = null
      let lastStartDate = null
      for (const childTask of rawTask.children) {
        const subtask = await importTaskData(childTask, task)

        lastEndDate = !lastEndDate ? subtask.endDate : lastEndDate > subtask.endDate ? lastEndDate : subtask.endDate
        lastStartDate = !lastStartDate ? subtask.startDate : lastStartDate < subtask.startDate ? lastStartDate : subtask.startDate
      }

      // 그룹 태스크의 기간(duration)을 계산합니다.
      const calculatedDuration =
        lastEndDate && lastStartDate
          ? Math.ceil((lastEndDate.getTime() - lastStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
          : 0

      task = await taskRepository.findOne({ where: { id: task.id } })

      return await taskRepository.save({
        ...task,
        startDate: lastStartDate,
        endDate: lastEndDate,
        duration: calculatedDuration
      })
    }

    return task
  }

  // 루트 태스크들 임포트
  for (const rootTask of tasks) {
    await importTaskData(rootTask)
  }
}
