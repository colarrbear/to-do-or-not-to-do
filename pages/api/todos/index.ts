import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]";
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

  switch (req.method) {
    case "GET":
      try {
        const todos = await prisma.todo.findMany({
          where: {
            userId,
          },
          include: {
            tags: {
              include: {
                tag: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        return res.status(200).json(todos);
      } catch (error) {
        console.error("Error fetching todos:", error);
        return res.status(500).json({ error: "Failed to fetch todos" });
      }

    case "POST":
      try {
        const { title, description, status, priority, dueDate, tags } = req.body;

        // Check if user has less than 50 todos
        const todoCount = await prisma.todo.count({
          where: {
            userId,
          },
        });

        if (todoCount >= 50) {
          return res
            .status(400)
            .json({ error: "You can have a maximum of 50 todos" });
        }

        const todo = await prisma.todo.create({
          data: {
            title,
            description,
            status: status || "PENDING",
            priority: priority || 1,
            dueDate: dueDate ? new Date(dueDate) : null,
            userId,
          },
        });

        // Add tags if provided
        if (tags && tags.length > 0) {
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
                todoId: todo.id,
                tagId: tag.id,
              },
            });
          }
        }

        // Fetch the created todo with tags to return a complete response
        const todoWithTags = await prisma.todo.findUnique({
          where: { id: todo.id },
          include: {
            tags: {
              include: {
                tag: true,
              },
            },
          },
        });

        return res.status(201).json(todoWithTags);
      } catch (error) {
        console.error("Error creating todo:", error);
        return res.status(500).json({ error: "Failed to create todo" });
      }

    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
} 