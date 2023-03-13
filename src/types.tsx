import { Prisma } from '@prisma/client'

/**
 * A version of Recycle that includes the mapItem relation
 */
export type DeepRecycle = Prisma.RecycleGetPayload<{
  include: { mapItem: true }
}>

/**
 * A version of Story that includes the mapItem relation
 */
export type DeepStory = Prisma.StoryGetPayload<{
  include: { mapItem: true }
}>

/**
 * The data format used when creating a new `Recycle` object in the database.
 */
export type DeepRecycleInput = Prisma.RecycleCreateWithoutMapItemInput & {
  mapItem: Prisma.MapItemCreateWithoutRecycleInput
}

/**
 * The data format used when creating a new `Story` object in the database.
 */
export type DeepStoryInput = Prisma.StoryCreateWithoutMapItemInput & {
  mapItem: Prisma.MapItemCreateWithoutStoryInput
}

/**
 * @param projectType Array of strings containing the project types to filter by.
 * @param years Array of numbers, where the highest number is the max year and the lowest number is the min year. Can contain a single number, which will be used as both the min and max year.
 * @param months Array of numbers, where the highest number is the max month and the lowest number is the min month. Can contain a single number, which will be used as both the min and max month.
 * @param availableCategories Array of strings containing the materials to filter by
 * @param lookingForCategories Array of strings containing the materials to filter by
 * @param organisation Array of strings containing the organisations to filter by
 */
export type Filter = {
  /**
   * Array of strings containing the project types to filter by.
   */
  projectType?: string[],
  /**
   * Array of numbers, where the highest number is the max year and the lowest number is the min year. Can contain a single number, which will be used as both the min and max year.
   */
  years?: number[],
  /**
   * Array of numbers, where the highest number is the max month and the lowest number is the min month. Can contain a single number, which will be used as both the min and max month.
   */
  months?: number[],
  /**
   * Array of strings containing the materials to filter by
   */
  availableCategories?: string[],
  /**
   * Array of strings containing the materials to filter by
   */
  lookingForCategories?: string[],
  /**
   * Array of strings containing the organisations to filter by
   */
  organisation?: string[],
  /**
   * String containing the search input
   */
  searchInput?: string,
}