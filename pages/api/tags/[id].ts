import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import authOptions from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { Session } from "next-auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions) as Session | null;

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const tagId = parseInt(req.query.id as string);

  // Check if tag exists
  const tag = await prisma.tag.findUnique({
    where: { id: tagId },
  });

  if (!tag) {
    return res.status(404).json({ error: "Tag not found" });
  }

  switch (req.method) {
    case "GET":
      try {
        return res.status(200).json(tag);
      } catch (error) {
        console.error("Error fetching tag:", error);
        return res.status(500).json({ error: "Failed to fetch tag" });
      }

    case "PUT":
      try {
        const { name } = req.body;

        if (!name) {
          return res.status(400).json({ error: "Tag name is required" });
        }

        // Check if the new name already exists for a different tag
        const existingTag = await prisma.tag.findUnique({
          where: { name },
        });

        if (existingTag && existingTag.id !== tagId) {
          return res.status(409).json({ error: "Tag with this name already exists" });
        }

        // Update the tag
        const updatedTag = await prisma.tag.update({
          where: { id: tagId },
          data: { name },
        });

        return res.status(200).json(updatedTag);
      } catch (error) {
        console.error("Error updating tag:", error);
        return res.status(500).json({ error: "Failed to update tag" });
      }

    case "DELETE":
      try {
        // Check if tag is in use
        const usedTags = await prisma.todoTag.findMany({
          where: { tagId },
        });

        if (usedTags.length > 0) {
          return res.status(400).json({ 
            error: "Cannot delete tag that is in use",
            count: usedTags.length
          });
        }

        // Delete the tag
        await prisma.tag.delete({
          where: { id: tagId },
        });

        return res.status(204).end();
      } catch (error) {
        console.error("Error deleting tag:", error);
        return res.status(500).json({ error: "Failed to delete tag" });
      }

    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
} 