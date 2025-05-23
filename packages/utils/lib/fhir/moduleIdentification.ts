import { Patient, Appointment } from 'fhir/r4b';
// we should be able to get rid of this module tag entirely
export enum OTTEHR_MODULE {
  IP = 'OTTEHR-IP',
  BH = 'OTTEHR-BH', // this isn't a thing anymore
  TM = 'OTTEHR-TM',
}

export const isInPersonAppointment = (appointment: Appointment): boolean => {
  const tags = appointment.meta?.tag ?? [];

  return tags.some((tag) => {
    return tag.code === OTTEHR_MODULE.IP;
  });
};

export const isBHResource = (resource: Appointment | Patient): boolean => {
  const tags = resource.meta?.tag ?? [];

  return tags.some((tag) => {
    return tag.code === OTTEHR_MODULE.BH;
  });
};
