export interface DailyCapture {
    eventId?: string; // optional as it will come back from pharma once created
    date: string;
    didSmokeToday: boolean;
    cigarettesSmoked: number;
    didSkip: boolean; // optional
  }

  export interface pharmaDailyCaptureEvent {
    attributes: {
      cigarettesSmoked: number;
      date: string;
      didSmokeToday: boolean;
      username: string;
      didSkip?: boolean;
    };
    createTime: string;
    createdBy: string;
    eventType: string;
    id: string;
    instance: string;
    isActive: boolean;
    janrainId: string;
    lastModifiedTime: string;
    modifiedBy: string;
    personId: string;
    resourceType: string;
  }
