import { TFormProject } from "@/types/project";
import { create } from "zustand";

type TFormCreateProjectStore = {
  form: TFormProject;
  setForm: (form: TFormProject) => void;
  formType: "newbie" | "advanced";
  setFormType: (formType: "newbie" | "advanced") => void;
  logoFile?: File | null;
  bannerFile?: File | null;
  logoPreview?: string | null;
  bannerPreview?: string | null;
  setMedia: (media: {
    logoFile?: File | null;
    bannerFile?: File | null;
    logoPreview?: string | null;
    bannerPreview?: string | null;
  }) => void;
};

export const useFormCreateProject = create<TFormCreateProjectStore>()(
  (set) => ({
    form: {} as TFormProject,
    formType: "advanced",
    setForm: (form) => set(() => ({ form })),
    setFormType: (formType) => set(() => ({ formType })),
    logoFile: null,
    bannerFile: null,
    logoPreview: null,
    bannerPreview: null,
    setMedia: (media) =>
      set((state) => ({
        logoFile:
          media.logoFile !== undefined ? media.logoFile : state.logoFile,
        bannerFile:
          media.bannerFile !== undefined ? media.bannerFile : state.bannerFile,
        logoPreview:
          media.logoPreview !== undefined
            ? media.logoPreview
            : state.logoPreview,
        bannerPreview:
          media.bannerPreview !== undefined
            ? media.bannerPreview
            : state.bannerPreview,
      })),
  })
);
