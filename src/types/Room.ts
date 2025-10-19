export interface Room {
  id: string;
  name: string;
  capacity: number;
  organizationId: string;
}

export interface RoomFormData {
  name: string;
  capacity: number;
}