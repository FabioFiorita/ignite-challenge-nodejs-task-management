import { swagger } from '@elysiajs/swagger'
import { PrismaClient } from '@prisma/client'
import { Elysia, t } from 'elysia'

import { TaskService } from './services/task.service'

const prisma = new PrismaClient()
const taskService = new TaskService(prisma)

const app = new Elysia()
  .use(swagger())
  .group('/tasks', (app) =>
    app
      .post(
        '/',
        ({ body: { title, description } }) =>
          taskService.addTask(title, description),
        {
          body: t.Object(
            {
              title: t.String(),
              description: t.String(),
            },
            {
              description: 'Expected a title and description',
            },
          ),
          detail: {
            summary: 'Create a new task',
            description: 'Create a new task with a title and description',
            responses: {
              201: {
                description: 'Task created successfully',
              },
            },
          },
        },
      )
      .get('/', () => taskService.getTasks(), {
        detail: {
          summary: 'Get all tasks',
          description: 'Fetch all tasks from the database',
          responses: {
            200: {
              description: 'Return all tasks in the database',
            },
          },
        },
      })
      .put(
        '/:id',
        ({ params: { id }, body: { title, description } }) =>
          taskService.updateTask(id, title, description),
        {
          body: t.Object({
            title: t.String(),
            description: t.String(),
          }),
          detail: {
            summary: 'Update a task',
            description: 'Update a task with a new title and description',
            responses: {
              200: {
                description: 'Task updated successfully',
              },
            },
          },
        },
      )
      .delete('/:id', ({ params: { id } }) => taskService.deleteTask(id), {
        detail: {
          summary: 'Delete a task',
          description: 'Delete a task by its ID',
          responses: {
            200: {
              description: 'Task deleted successfully',
            },
          },
        },
      })
      .patch(
        '/:id/complete',
        ({ params: { id } }) => taskService.completeTask(id),
        {
          detail: {
            summary: 'Complete a task',
            description: 'Mark a task as completed by its ID',
            responses: {
              200: {
                description: 'Task marked as completed successfully',
              },
            },
          },
        },
      )
      .post('/upload', ({ body: { file } }) => taskService.uploadTasks(file), {
        type: 'multipart/form-data',
        body: t.Object({
          file: t.File({
            type: 'text/csv',
          }),
        }),
        detail: {
          summary: 'Upload tasks',
          description: 'Upload tasks from a CSV file',
          responses: {
            201: {
              description: 'Tasks uploaded successfully',
            },
          },
        },
      }),
  )
  .listen(3000)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
)
