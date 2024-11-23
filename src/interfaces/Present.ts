export type PresentStatus = 'reserved' | 'available';

export type Present = {
    id: string;
    title: string;
    description?: string;
    image?: string;
    status: PresentStatus;
    reservedBy?: string;
}