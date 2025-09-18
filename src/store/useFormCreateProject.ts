import { TFormProject } from "@/types/project";
import { create } from "zustand";

type TFormCreateProjectStore = {
  form: TFormProject;
  setForm: (form: TFormProject) => void;
  formType: "newbie" | "advanced";
  setFormType: (formType: "newbie" | "advanced") => void;
};

export const useFormCreateProject = create<TFormCreateProjectStore>()(
  (set) => ({
    form: {} as TFormProject,
    formType: "advanced",
    setForm: (form) => set(() => ({ form })),
    setFormType: (formType) => set(() => ({ formType })),
  })
);
