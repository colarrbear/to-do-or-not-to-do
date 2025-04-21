import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import authOptions from "@/lib/authOptions";
import { Session } from "next-auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions) as Session | null;

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!session.user?.id) {
    return res.status(401).json({ error: "User ID not found in session" });
  }

  const userId = parseInt(session.user.id);
  const todoId = parseInt(req.query.id as string);

  // Verify the todo belongs to the user
  const todo = await prisma.todo.findUnique({
    where: { id: todoId },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  if (!todo) {
    return res.status(404).json({ error: "Todo not found" });
  }

  if (todo.userId !== userId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  switch (req.method) {
    case "GET":
      try {
        return res.status(200).json(todo);
      } catch (error) {
        console.error("Error fetching todo:", error);
        return res.status(500).json({ error: "Failed to fetch todo" });
      }

    case "PUT":
      try {
        const { title, description, status, priority, dueDate, photoUrl, tags } =
          req.body;

        const updatedTodo = await prisma.todo.update({
          where: { id: todoId },
          data: {
            title,
            description,
            status,
            priority,
            dueDate: dueDate ? new Date(dueDate) : null,
            photoUrl,
          },
        });

        // Update tags if provided
        if (tags) {
          // Remove existing tags
          await prisma.todoTag.deleteMany({
            where: { todoId },
          });

          // Add new tags
          for (const tagName of tags) {
            // Find or create the tag
            let tag = await prisma.tag.findUnique({
              where: { name: tagName },
            });

            if (!tag) {
              tag = await prisma.tag.create({
                data: { name: tagName },
              });
            }

            // Create the TodoTag relation
            await prisma.todoTag.create({
              data: {
                todoId,
                tagId: tag.id,
              },
            });
          }
        }

        // Get the updated todo with its tags
        const todoWithTags = await prisma.todo.findUnique({
          where: { id: todoId },
          include: {
            tags: {
              include: {
                tag: true,
              },
            },
          },
        });

        return res.status(200).json(todoWithTags);
      } catch (error) {
        console.error("Error updating todo:", error);
        return res.status(500).json({ error: "Failed to update todo" });
      }

    case "DELETE":
      try {
        // Delete related TodoTag entries first
        await prisma.todoTag.deleteMany({
          where: { todoId },
        });

        // Then delete the todo
        await prisma.todo.delete({
          where: { id: todoId },
        });

        return res.status(204).end();
      } catch (error) {
        console.error("Error deleting todo:", error);
        return res.status(500).json({ error: "Failed to delete todo" });
      }

    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
} 