"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useProjectDetail } from "@/modules/project/project.query";
import ContentLoader from "./content-loader";
import ProjectContent from "./content";

function ProjectDetail() {
  const { projectId } = useParams();
  const { data, isLoading } = useProjectDetail(projectId as string);

  if (isLoading) {
    return <ContentLoader />;
  }

  if (!data) {
    return <div>Project not found</div>;
  }

  return <ProjectContent data={data} />;
}

export default ProjectDetail;
