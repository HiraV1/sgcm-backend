/* tipo de resposta padrão para paginação, evitando o uso de Any */
export interface PaginatedResponse<T> {
  data: T[];

  meta: {
    totalItems: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
