"use client"
import { TFormProject } from "@/types/project";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import projectService from "./project.service";
import { useSearchParams } from "next/navigation";
import { toObjectQuery } from "@/lib/param";
import { useVestingStore } from "@/store/useVestingStore";
import { useEffect } from "react";


export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TFormProject) => projectService.CREATE(data),
    onSuccess: () => {
      toast.success('Success', {
        description: "Success submit project, waiting for review team!"
      })
      queryClient.invalidateQueries({
        queryKey: ["get_project"]
      });
    },
    onError: () => {
      toast.error('Error', {
        description: "Fail to submit data!"
      })
    }
  });
};

export const useProject = (filters?: { status?: string }) => {
  const searchString = useSearchParams();
  const query = {
    ...toObjectQuery(searchString),
    ...(filters?.status && { status: filters.status })
  }
  return useQuery({
    queryKey: ["get_project", query],
    queryFn: () => projectService.GET(query),
    enabled: true
  });
}
export const useAllProject = (filters?: { status?: string }) => {
  const searchString = useSearchParams();
  const query = {
    ...toObjectQuery(searchString),
    ...(filters?.status && { status: filters.status })
  }
  return useQuery({
    queryKey: ["get_project", query],
    queryFn: () => projectService.GET_ALL(query),
    enabled: true
  });
}

export const usePublicProject = (filters?: { status?: string }) => {
  const searchString = useSearchParams();
  const query = {
    ...toObjectQuery(searchString),
    ...(filters?.status && { status: filters.status }),
  }
  return useQuery({
    queryKey: ["get_project", query],
    queryFn: () => projectService.GET_PUBLIC(query),
    enabled: true
  });
}

export const useProjectDetail = (id?: string) => {
  const setVestingData = useVestingStore((state) => state.setData);
  const query = useQuery({
    queryKey: ["get_project_by_id", id],
    queryFn: () => projectService.DETAIL(id!),
    enabled: !!id,
  });
  useEffect(() => {
    if (query.data?.allocations) {
      setVestingData(query.data.allocations);
    }
  }, [query.data, setVestingData]);
  return query;
};
export const useUpdateProject = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TFormProject) => projectService.UPDATE(id, data),
    onSuccess: () => {
      toast.success('Success', {
        description: "Success update project, waiting for review team!"
      })
      queryClient.invalidateQueries({
        queryKey: ["get_project"]
      });
    },
    onError: () => {
      toast.error('Error', {
        description: "Fail to update data!"
      })
    }
  });
};
export const useUpdateAllocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data:
      {
        projectId: string,
        id: string, contractAddress: string
      }) => projectService.UPDATE_ALLOCATION({
        id: data.id,
        contractAddress: data.contractAddress,
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["get_project_by_id", variables.projectId]
      });
    },
    onError: () => {
      toast.error('Error', {
        description: "Fail to update data!"
      })
    }
  });
};
export const useSetAllocationDeploy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { projectId: string, allocations: { id: string }[] }) => projectService.SET_ALLOCATION_DEPLOY(data.allocations),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["get_project_by_id", variables.projectId]
      });
    },
    onError: () => {
      toast.error('Error', {
        description: "Fail to update data!"
      })
    }
  });
};
export const useSetDistributedLocker = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      projectId: string,
      lockerDistribution: {
        id: string,
        lockerDistributeHash: string
      }
    }) => projectService.SET_DISTRIBUTED_LOCKER(data.lockerDistribution),
    onSuccess: (_data, variables) => {
      toast.success('Success', {
        description: `Locker has been disributed!`
      })
      queryClient.invalidateQueries({
        queryKey: ["get_project_by_id", variables.projectId]
      });
    },
    onError: () => {
      toast.error('Error', {
        description: "Fail to update data!"
      })
    }
  });
};