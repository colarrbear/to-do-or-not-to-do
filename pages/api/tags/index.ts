import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";
import { Session } from "next-auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions) as Session | null;

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = parseInt(session.user.id);
  switch (req.method) {
    case "GET":
      try {
        // Get all tags for this user
        const tags = await prisma.tag.findMany({
          where: { userId },
          orderBy: { name: "asc" },
        });

        return res.status(200).json(tags);
      } catch (error) {
        console.error("Error fetching tags:", error);
        return res.status(500).json({ error: "Failed to fetch tags" });
      }

    case "POST":
      try {
        const { name } = req.body;

        if (!name) {
          return res.status(400).json({ error: "Tag name is required" });
        }

        // Check if tag already exists for this user
        const existingTag = await prisma.tag.findUnique({
          where: { name_userId: { name, userId } },
        });

        if (existingTag) {
          return res.status(409).json({ error: "Tag already exists" });
        }

        // Create new tag for this user
        const tag = await prisma.tag.create({
          data: { name, userId },
        });

        return res.status(201).json(tag);
      } catch (error) {
        console.error("Error creating tag:", error);
        return res.status(500).json({ error: "Failed to create tag" });
      }

    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
} 