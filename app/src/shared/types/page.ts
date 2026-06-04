export type PageResponse<TItem> = {
  content: TItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};
