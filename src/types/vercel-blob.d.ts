declare module '@vercel/blob' {
  export interface PutBlobResult {
    url: string;
    downloadUrl: string;
    pathname: string;
    contentType: string;
    contentDisposition: string;
  }

  export interface ListBlobResult {
    blobs: Array<{
      url: string;
      pathname: string;
      size: number;
      uploadedAt: Date;
      downloadUrl: string;
    }>;
    cursor?: string;
    hasMore: boolean;
  }

  export interface PutOptions {
    access: 'public' | 'private';
    addRandomSuffix?: boolean;
    cacheControlMaxAge?: number;
    contentType?: string;
  }

  export function put(
    pathname: string,
    body: File | Blob | ArrayBuffer | string,
    options?: PutOptions
  ): Promise<PutBlobResult>;

  export function del(url: string | string[]): Promise<void>;

  export function list(options?: {
    limit?: number;
    cursor?: string;
    prefix?: string;
  }): Promise<ListBlobResult>;
}
