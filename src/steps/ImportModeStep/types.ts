import { InfoWithSource } from "../../types"

export type Meta = { __index: string; __errors?: Error | null }
export type ErrorInfo = { [key: string]: InfoWithSource }
export type Errors = { [id: string]: Error }

export type DataObject = { [key: string]: any; __errors?: any; __index?: string }
