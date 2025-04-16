export interface TARequest {
    id: number,
    status: string,
    depth: string,
    description: string,
    date_created: string,
    proj_start_date: string | null,
    proj_end_date: string | null,
    actual_completion_date: string | null
}