export interface Room {
  id: string;
  name: string;
  capacity: number;
  description?: string;
  organizationId: string;
}

export interface RoomFormData {
  name: string;
  capacity: number;
  description?: string;
}