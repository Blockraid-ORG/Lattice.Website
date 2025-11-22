"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";
import { useParams } from "next/navigation";
import { useProjectDetail } from "@/modules/project/project.query";
import { ModalLiquidity } from "@/components/liquidity-pool/modal-liquidity";
import { ConfirmationModal } from "@/components/liquidity-pool/confirmation-modal";

export default function ActionsLiquidity() {
  const { projectId } = useParams();
  const { data: project, isLoading } = useProjectDetail(
    Array.isArray(projectId) ? projectId[0] : projectId?.toString() || ""
  );

  const [openLiquidityModal, setOpenLiquidityModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalData, setModalData] = useState<any>(null);

  const handleOpen = () => {
    if (!project?.chains || project.chains.length === 0) {
      console.error("No chain data available");
      return;
    }

    if (!project?.contractAddress) {
      console.error("No contract address available");
      return;
    }

    setOpenLiquidityModal(true);
  };

  if (isLoading) return <div>Loading...</div>;

  if (project?.status === "DEPLOYED") {
    return (
      <>
        <Button
          onClick={handleOpen}
          size="sm"
          variant="default"
          className="flex items-center gap-2"
        >
          <Icon className="text-sm" name="mdi:water-plus" />
          Add Liquidity
        </Button>

        <ModalLiquidity
          open={openLiquidityModal}
          setOpen={setOpenLiquidityModal}
          setShowConfirmModal={setShowConfirmModal}
          setModalData={setModalData}
          projectData={{
            name: project.name,
            ticker: project.ticker,
            contractAddress: project.contractAddress,
            chains: project.chains,
            logo: project.logo || "",
          }}
        />

        {/* Confirmation Modal - This was missing! */}
        {modalData && (
          <ConfirmationModal
            showConfirmModal={showConfirmModal}
            setShowConfirmModal={setShowConfirmModal}
            setOpen={setOpenLiquidityModal}
            {...modalData}
          />
        )}
      </>
    );
  }

  return null;
}
