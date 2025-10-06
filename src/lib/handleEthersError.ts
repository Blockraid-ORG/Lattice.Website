import { ethers } from "ethers";

const ERRORS = [
  "error NotOwner()",
  "error InvalidSender()",
  "error PresaleNotStartedYet()",
  "error PresaleFinalized()",
  "error PresaleEnded()",
  "error HardCapReached()",
  "error NotWhitelisted()",
  "error ContributionTooHigh()",
  "error RefundFailed()",
  "error AlreadyFinalized()",
  "error PresaleStillActive()",
  "error ClaimNotStarted()",
  "error NoContribution()",
  "error AlreadyClaimed()",
  "error WithdrawFailed()",
  "error RefundNotAllowed()",
  "error RefundTransferFailed()",
  "error ZeroAddress()",
  "error NoUnclaimedTokens()",
  "error AmountZero()",
  "error CannotRescueSaleToken()",
  "error InvalidParams()",
];

const iface = new ethers.Interface(ERRORS);

const ERROR_MESSAGES: Record<string, string> = {
  NotOwner: "You are not the contract owner.",
  InvalidSender: "The transaction sender is invalid.",
  PresaleNotStartedYet: "The presale has not started yet.",
  PresaleFinalized: "This presale has already been finalized.",
  PresaleEnded: "The presale has already ended.",
  HardCapReached: "The presale hard cap has been reached.",
  NotWhitelisted: "You are not whitelisted for this presale.",
  ContributionTooHigh: "Your contribution exceeds the allowed limit.",
  RefundFailed: "Refund transaction failed.",
  AlreadyFinalized: "Presale has already been finalized.",
  PresaleStillActive: "The presale is still active.",
  ClaimNotStarted: "Claim period has not started yet.",
  NoContribution: "You have no contribution to claim or refund.",
  AlreadyClaimed: "Tokens have already been claimed.",
  WithdrawFailed: "Withdrawal failed.",
  RefundNotAllowed: "Refunds are not allowed at this stage.",
  RefundTransferFailed: "Token transfer for refund failed.",
  ZeroAddress: "Address cannot be zero.",
  NoUnclaimedTokens: "No unclaimed tokens left to sweep.",
  AmountZero: "Amount cannot be zero.",
  CannotRescueSaleToken: "Cannot rescue tokens that belong to the presale.",
  InvalidParams: "Invalid parameters provided.",
};

export function parseContractError(err: unknown): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const e = err as any;
  const data = e?.data || e?.error?.data || e?.info?.error?.data;

  if (data) {
    try {
      const decoded = iface.parseError(data);
      if (decoded && decoded.name) {
        const readable = ERROR_MESSAGES[decoded.name] || decoded.name;
        return readable;
      }
    } catch {
      // ignore decode failure
    }
  }

  if (typeof e?.shortMessage === "string") return e.shortMessage;
  if (typeof e?.message === "string") return e.message;

  return "Unknown transaction error.";
}
