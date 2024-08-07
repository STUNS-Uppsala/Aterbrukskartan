import { DeepRecycle, RecycleFilter } from "@/types";
import { MapItem, Recycle } from "@prisma/client";
import { yearLimitsRecycle } from "@/pages/aterbruk";
import { filterByYear, filterByOrganisation, filterByActive } from "./commonFilters";

export default runActiveFilters;

/**
 * Looks through most of the fields of the Recycle objects and returns an array of the objects that match the search string.
 * @param data Array of DeepRecycle objects to search through.
 * @param search String to search for.
 * @returns Recycle objects where a field matches the search string.
 */
export function filterBySearchInput(data: DeepRecycle[], search: string): DeepRecycle[] {
  let returnData: DeepRecycle[] = [];

  // Fields to search through in the Recycle objects.
  let recycleSearchFields = [
    "projectType",
    "description",
    "contact",
    "externalLinks",
    "availableMaterials",
    "lookingForMaterials",
  ]

  // Fields to search through in the MapItem objects.
  let mapItemSearchFields = [
    "name",
    "organisation",
    "year",
    "address",
    "postcode",
    "city",
  ]

  // RegExps for the months in Swedish, surrounded by word boundaries.
  // The word boundaries are used to prevent the RegExp from matching a string that contains the month name, but is not the month name, like "januari" in "januarii".
  let months = [
    /\bjanuari\b/,
    /\bfebruari\b/,
    /\bmars\b/,
    /\bapril\b/,
    /\bmaj\b/,
    /\bjuni\b/,
    /\bjuli\b/,
    /\baugusti\b/,
    /\bseptember\b/,
    /\boctober\b/,
    /\bnovember\b/,
    /\bdecember\b/,
  ]

  let lowerCaseSearch: string = search.toLowerCase();

  for (let i in data) {
    // Used to continue to next iteration of the outer loop if a match is found in the first or second inner loop.
    let breakCheck = false;

    // Search through the fields in the Recycle objects.
    for (let j of recycleSearchFields) {
      if (!data[i][j as keyof DeepRecycle]) continue;
      if (String(data[i][j as keyof DeepRecycle])?.toLowerCase().includes(lowerCaseSearch)) {
        returnData.push(data[i]);
        breakCheck = true;
        break;
      }
    }

    if (breakCheck) continue;

    // Search through the months in the Recycle objects.
    for (let month of months) {
      if (month.test(lowerCaseSearch) && data[i].month === months.indexOf(month) + 1) {
        returnData.push(data[i]);
        breakCheck = true;
        break;
      }
    }

    if (breakCheck) continue;

    // Search through the fields in the MapItem objects.
    for (let k of mapItemSearchFields) {
      if (!data[i].mapItem[k as keyof MapItem]) continue;
      if (String(data[i].mapItem[k as keyof MapItem])?.toLowerCase().includes(lowerCaseSearch)) {
        returnData.push(data[i]);
        break;
      }
    }
  }
  return returnData;
}

/**
 * Filters out recycle objects that do not have a project type that matches with at least one of the project types in the projectType parameter.
 * @param data Array of DeepRecycle objects to filter by project type.
 * @param projectType Array of strings containing the project types to filter by.
 * @returns Recycle objects with a project type that matches with *one or more* of the project types in the projectType parameter.
 */
export function filterByProjectType(data: DeepRecycle[], projectType: string[]): DeepRecycle[] {
  let returnData: DeepRecycle[] = [];
  for (let i in data) {
    for (let j in data[i].projectType?.split(", ")) {
      if (projectType.includes(data[i].projectType?.split(", ")[j])) {
        returnData.push(data[i]);
        break;
      }
    }
  }
  return returnData;
}

/**
 * Filters out recycle objects that do not have a month that is within the range of the month parameter.
 * @param data Array of DeepRecycle objects to filter by month.
 * @param months Array of numbers, where the highest number is the max month and the lowest number is the min month. Can contain a single number, which will be used as both the min and max month.
 * @returns The recycle objects that have a month that is within the range of the month parameter.
 */
export function filterByMonth(data: DeepRecycle[], months: number[]): DeepRecycle[] {
  let returnData: DeepRecycle[] = [];
  for (let i in data) {
    if (data[i].month! <= Math.max(...months) && data[i].month! >= Math.min(...months)) {
      returnData.push(data[i]);
    }
  }
  return returnData;
}

/**
 * Filters out recycle objects that are not looking for any of the materials in the lookingFor parameter
 * @param data Array of DeepRecycle objects to filter by the materials they are looking for
 * @param lookingFor Array of strings containing the materials to filter by
 * @returns Recycle objects that are looking for *one or more* of the materials in the lookingFor parameter
 */
export function filterByLookingFor(data: DeepRecycle[], lookingFor: string[]): DeepRecycle[] {
  let returnData: DeepRecycle[] = [];
  for (let i in data) {
    for (let j in data[i].lookingForMaterials?.split(", ")) {
      if (lookingFor.includes(data[i].lookingForMaterials!.split(", ")[j as any])) {
        returnData.push(data[i]);
        break;
      }
    }
  }
  return returnData;
}

/**
 * Filters out recycle objects that are not offering any of the materials in the available parameter
 * @param data Array of DeepRecycle objects to filter by the materials they have available
 * @param available Array of strings containing the materials to filter by
 * @returns Recycle objects offering *one or more* of the materials in the available parameter
 */
export function filterByAvailable(data: DeepRecycle[], available: string[]): DeepRecycle[] {
  let returnData: DeepRecycle[] = [];
  // Just like the filterByLookingFor function, this function is a bit hard to understand. See the comments there for more info.
  for (let i in data) {
    for (let j in data[i].availableMaterials?.split(", ")) {
      if (available.includes(data[i].availableMaterials!.split(", ")[j as any])) {
        returnData.push(data[i]);
        break;
      }
    }
  }
  return returnData;
}

export function filterByAttachment(data: DeepRecycle[], attachment: boolean): DeepRecycle[] {
  let returnData: DeepRecycle[] = [];
  for (let i in data) {
    if (attachment && data[i].attachment) {
      returnData.push(data[i]);
    }
  }
  return returnData;
}

/**
 * Filters through the data parameter using the filters parameter
 * @param data Array of DeepRecycle objects to run through filters
 * @param filters Which filters to apply
 * @returns Filtered list of DeepRecycle objects
 */
export function runActiveFilters(data: DeepRecycle[], filters: RecycleFilter): DeepRecycle[] {
  let returnData: DeepRecycle[] = data;

  if (filters.projectType?.length) {
    returnData = filterByProjectType(returnData, filters.projectType);
  }
  // The year and month filters are not run if they are in their respective default states
  if (filters.years && (Math.max(...filters.years) != yearLimitsRecycle.max || Math.min(...filters.years) != yearLimitsRecycle.min)) {
    returnData = filterByYear(returnData, filters.years) as DeepRecycle[];
  }
  if (filters.months && (Math.max(...filters.months) != 12 || Math.min(...filters.months) != 1)) {
    returnData = filterByMonth(returnData, filters.months);
  }
  if (filters.availableCategories?.length) {
    returnData = filterByAvailable(returnData, filters.availableCategories);
  }
  if (filters.lookingForCategories?.length) {
    returnData = filterByLookingFor(returnData, filters.lookingForCategories);
  }
  if (filters.organisation?.length) {
    returnData = filterByOrganisation(returnData, filters.organisation) as DeepRecycle[];
  }
  if (filters.searchInput) {
    returnData = filterBySearchInput(returnData, filters.searchInput);
  }
  if (filters.showInactive) {
    returnData = filterByActive(returnData, filters.showInactive) as DeepRecycle[];
  }
  if (filters.attachment) {
    returnData = filterByAttachment(returnData, filters.attachment);
  }
  return returnData;
}