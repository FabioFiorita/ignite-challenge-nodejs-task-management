import { PrismaClient, Task } from '@prisma/client'
import { parse } from 'csv-parse'
import { ParseError } from 'elysia'

export class TaskService {
  prisma: PrismaClient
  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  async addTask(title: string, description: string) {
    await this.prisma.task.create({
      data: {
        title,
        description,
      },
    })
    return { message: 'Task created successfully' }
  }

  async getTasks() {
    return await this.prisma.task.findMany()
  }

  async updateTask(id: string, title: string, description: string) {
    await this.prisma.task.update({
      where: {
        id: Number(id),
      },
      data: {
        title,
        description,
      },
    })

    return { message: 'Task updated successfully' }
  }

  async deleteTask(id: string) {
    await this.prisma.task.delete({
      where: {
        id: Number(id),
      },
    })

    return { message: 'Task deleted successfully' }
  }

  async completeTask(id: string) {
    await this.prisma.task.update({
      where: {
        id: Number(id),
      },
      data: {
        completed_at: new Date(),
      },
    })

    return { message: 'Task completed successfully' }
  }

  async uploadTasks(file: File) {
    const headers = ['title', 'description']

    const fileContent = await file.text()

    parse(
      fileContent,
      {
        delimiter: ',',
        columns: headers,
        fromLine: 2,
      },
      async (error, result: Task[]) => {
        if (error) {
          throw new ParseError('Failed to parse CSV file', error)
        }

        await this.prisma.task.createMany({
          data: result,
        })
      },
    )

    return { message: 'Tasks uploaded successfully' }
  }
}
