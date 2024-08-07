import { NextApiRequest, NextApiResponse } from 'next'
import { Prisma } from '@prisma/client'
import { DeepRecycle, DeepRecycleInput } from '@/types'
import prisma from '@/prismaClient'
import { getSession } from '@/session';
import { recycleSorter } from '@/functions/sorters';

/**
 * This API handles requests regarding recycle data, such as creating new Recycle objects, or fetching existing ones.
 * All requests except GET and HEAD require specific permissions (storyteller or admin)
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession(req, res);
  res.setHeader('Allow', ['GET', 'HEAD', 'POST', 'PUT', 'DELETE']);

  switch (req.method) {
    // On GET or HEAD requests, return the `Recycle` object with the given ID, or all `Recycle` objects if no ID is specified
    case 'GET':
    case 'HEAD':
      if (!parseInt(req.query.id as string)) {
        try {
          /** Returns all `Recycle` objects, with `mapItem` objects included. */
          let getData: DeepRecycle[] = await prisma.recycle.findMany({
            where: {
              isActive: true,
              isPublic: true,
              mapItem: {
                isActive: true
              },
            },
            include: {
              mapItem: true
            }
          })

          // If the user is a recycler, also return all non-public `Recycle` objects that are associated with the user's organisations
          if (session.user?.isRecycler && session.user?.recycleOrganisations?.length) {
            let additionalData: DeepRecycle[] = [];
            for (let org of session.user.recycleOrganisations) {
              await prisma.recycle.findMany({
                where: {
                  isActive: true,
                  mapItem: {
                    organisation: org,
                    isActive: true
                  }
                },
                include: {
                  mapItem: true
                }
              }).then((data) => {
                if (!data) { return; }
                additionalData.push(...data);
              })
            };
            getData.push(...additionalData);
          }

          // If the user is an admin, return all `Recycle` objects, including inactive ones
          if (session.user?.isAdmin) {
            let additionalData: DeepRecycle[] = [];
            await prisma.recycle.findMany({
              include: {
                mapItem: true
              }
            }).then((data) => {
              if (!data) { return; }
              additionalData.push(...data);
            })
            getData.push(...additionalData);
          }

          // Remove duplicates and sort the array
          getData = getData.filter((item, index) => {
            return getData.findIndex((item2) => {
              return item.id === item2.id
            }) === index
          }).sort(recycleSorter)

          getData.forEach((item) => {
            if (item.projectType.toLowerCase() == "rivning") item.projectType = "Demontering";
          });

          res.status(200).json(getData)
        }
        catch (err: any) {
          if (err instanceof Prisma.PrismaClientInitializationError) {
            res.status(500).json({ message: 'Failed to connect to database' });
          }
          else {
            res.status(500).json({ message: 'Internal server error' });
          }
        }
      }
      else {
        try {
          /** Returns the `Recycle` object with the given ID, with the `mapItem` object included, or throws an error if no `Recycle` object with the given ID exists. */
          const getData: DeepRecycle = await prisma.recycle.findFirstOrThrow({
            where: {
              id: parseInt(req.query.id as string)
            },
            include: {
              mapItem: true
            }
          })

          if (getData.projectType.toLowerCase() == "rivning") getData.projectType = "Demontering";

          res.status(200).json(getData)
        }
        catch (err: any) {
          if (err instanceof Prisma.PrismaClientKnownRequestError) {
            res.status(400).json({ message: 'Something went wrong when processing the request. The specified ID might not exist in the database.' });
          }
          else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
            res.status(400).json({ message: 'Something went wrong when processing the request. Cause unknown.' });
          }
          else if (err instanceof Prisma.PrismaClientInitializationError) {
            res.status(500).json({ message: 'Internal server error. Failed to connect to database.' });
          }
          else {
            res.status(500).json({ message: 'Internal server error' });
          }
        }
      }
      break;

    // On POST requests, create a new `Recycle` object and return it
    case 'POST':
      // Only recyclers and admins can create new `Recycle` objects
      if (!session.user?.isRecycler && !session.user?.isAdmin) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      try {
        const newPost: DeepRecycleInput = req.body;
        // Creates a proper Buffer from the (stringified) attachment data
        newPost.attachment = newPost.attachment ? Buffer.from(newPost.attachment) : null;
        // If the attachment is larger than 1MB (1048576 bytes), return a 400 error
        if (newPost.attachment && newPost.attachment?.byteLength > 1048576) {
          return res.status(400).json({ message: 'Attachment too large. Maximum size is 1MB.' });
        }
        /** Creates a new `Recycle` object with the given data, and returns it with the `mapItem` object included. */
        const savedPost = await prisma.recycle.create({
          data: {
            ...newPost,
            mapItem: {
              create: { ...newPost.mapItem }
            },
          },
          include: {
            mapItem: true
          },
        })

        res.status(201).json(savedPost);
      }
      catch (err: any) {
        if (err instanceof Prisma.PrismaClientKnownRequestError || err instanceof Prisma.PrismaClientUnknownRequestError) {
          res.status(400).json({ message: 'Bad request' });
        }
        else if (err instanceof Prisma.PrismaClientValidationError) {
          res.status(400).json({ message: 'Something went wrong when processing the request. Some field(s) seems to be missing or have an incorrect type.' });
        }
        else if (err instanceof Prisma.PrismaClientInitializationError) {
          res.status(500).json({ message: 'Internal server error. Failed to connect to database.' });
        }
        else {
          res.status(500).json({ message: 'Internal server error' });
        }
      }
      break;

    // On PUT requests, update the `Recycle` object with the given ID and return it
    // Throws an error if no ID is specified or no `Recycle` object with the given ID exists
    // This is because we only want to update existing objects, new objects should instead be created with POST requests
    case 'PUT':
      // Only recyclers and admins can update `Recycle` objects
      if (!session.user?.isRecycler && !session.user?.isAdmin) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      try {
        if (!parseInt(req.query.id as string)) throw new Error('No ID specified');

        const updateData: DeepRecycleInput = req.body;
        // Creates a proper Buffer from the (stringified) attachment data
        updateData.attachment = updateData.attachment ? Buffer.from(updateData.attachment) : null;
        // If the attachment is larger than 1MB (1048576 bytes), return a 400 error
        if (updateData.attachment && updateData.attachment?.byteLength > 1048576) {
          return res.status(400).json({ message: 'Attachment too large. Maximum size is 1MB.' });
        }
        /** Updates the `Recycle` object with the given ID with the given data, and returns it with the `mapItem` object included. */
        const updatedData = await prisma.recycle.update({
          where: {
            id: parseInt(req.query.id as string)
          },

          data: {
            ...updateData,
            mapItem: {
              update: { ...updateData.mapItem }
            },
          },

          include: {
            mapItem: true
          },
        });

        res.status(200).json(updatedData);
      }
      catch (err: any) {
        if (err.message === 'No ID specified') {
          res.status(400).json({ message: 'No ID specified' })
        }
        else if (err instanceof Prisma.PrismaClientKnownRequestError) {
          res.status(400).json({ message: 'Something went wrong when processing the request. The specified ID might not exist in the database.' });
        }
        else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
          res.status(400).json({ message: 'Something went wrong when processing the request. Cause unknown.' });
        }
        else if (err instanceof Prisma.PrismaClientValidationError) {
          res.status(400).json({ message: 'Something went wrong when processing the request. Some field(s) seems to be missing or have an incorrect type.' });
        }
        else if (err instanceof Prisma.PrismaClientInitializationError) {
          res.status(500).json({ message: 'Internal server error. Failed to connect to database.' });
        }
        else {
          res.status(500).json({ message: 'Internal server error' });
        }
      }
      break;

    // On DELETE requests, change the `isActive` field of the `Recycle` object with the given ID to false, and return it
    case 'DELETE':
      // Only recyclers and admins can delete `Recycle` objects
      if (!session.user?.isRecycler && !session.user?.isAdmin) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      try {
        if (!parseInt(req.query.id as string)) throw new Error('No ID specified');

        // Fetch the `Recycle` object to check its current `isActive` status
        const recycle = await prisma.recycle.findFirst({
          where: {
            id: parseInt(req.query.id as string)
          }
        })

        // If the object is already inactive and the user is not an admin, return a 403 error
        if (!recycle?.isActive && !session.user?.isAdmin) {
          return res.status(403).json({ message: 'Forbidden' });
        }

        // If the object is already inactive and the user is an admin, delete it permanently
        if (!recycle?.isActive && session.user?.isAdmin) {
          /** Deletes the `Recycle` object with the given ID, and returns it with the `mapItem` object included. */
          const deletedData = await prisma.recycle.delete({
            where: {
              id: parseInt(req.query.id as string)
            },
            include: {
              mapItem: true
            },
          });

          return res.status(200).json(deletedData);
        }

        // Otherwise, just deactivate the object
        const updateData: DeepRecycleInput = req.body;
        /** Updates the `Recycle` object with the given ID to be inactive, and returns it with the `mapItem` object included. */
        const updatedData = await prisma.recycle.update({
          where: {
            id: parseInt(req.query.id as string)
          },

          data: {
            isActive: false,
          },

          include: {
            mapItem: true
          },
        });

        res.status(200).json(updatedData);
      }
      catch (err: any) {
        if (err.message === 'No ID specified') {
          res.status(400).json({ message: 'No ID specified' })
        }
        else if (err instanceof Prisma.PrismaClientKnownRequestError) {
          res.status(400).json({ message: 'Something went wrong when processing the request. The specified ID might not exist in the database.' });
        }
        else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
          res.status(400).json({ message: 'Something went wrong when processing the request. Cause unknown.' });
        }
        else if (err instanceof Prisma.PrismaClientValidationError) {
          res.status(400).json({ message: 'Something went wrong when processing the request. Some field(s) seems to be missing or have an incorrect type.' });
        }
        else if (err instanceof Prisma.PrismaClientInitializationError) {
          res.status(500).json({ message: 'Internal server error. Failed to connect to database.' });
        }
        else {
          res.status(500).json({ message: 'Internal server error' });
        }
      }
      break;

    // If the request method is not one of the above, return a 405 error
    default:
      res.status(405).json({ message: 'Method not allowed' });
      break;
  }
}