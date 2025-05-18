import { ClassOption } from "../data/types";

export const findClassLabel = (
  classId: string,
  options: ClassOption[],
): string => {
  const option = options.find((opt) => opt.value === classId);
  return option ? option.label : classId;
};
