import { CompleteSchema, DirectusFile } from "@directus/sdk"

export interface Person {
  id: number
  name: string
  email: string
  student: Student[]
}

export interface Student {
  id: number
  person: Person
  image?: Image
  major: string
  class: Class
}

export interface Image extends DirectusFile<Schema> {
  blurDataURL?: string
}

export enum Season {
  Spring = "Spring",
  Fall = "Fall",
  Winter = "Winter",
  Summer = "Summer",
}

export interface Class {
  id: number
  image?: Image
  season?: Season
  year: number
  location: Location
  students: Student[]
}

export interface Location {
  id: number
  city: string
}

interface CDTMSchema {
  classes: Class[]
  students: Student[]
  people: Person[]
}

export type Schema = CompleteSchema<CDTMSchema> 