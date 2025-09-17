declare module 'file-saver' {
  export function saveAs(data: Blob | File | string, filename?: string, options?: any): void
}

declare module 'papaparse' {
  interface ParseConfig {
    header?: boolean
    skipEmptyLines?: boolean
    complete?: (results: any) => void
    error?: (error: any) => void
  }
  const Papa: {
    parse: (file: File, config: ParseConfig) => void
    unparse: (data: any) => string
  }
  export default Papa
}


