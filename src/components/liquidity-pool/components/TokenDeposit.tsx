import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";
import BigNumber from "bignumber.js";

interface TokenDepositProps {
  // Token A props
  tokenAAmount: string;
  tokenASymbol: string;
  tokenAIcon: string;
  tokenABalance: any;
  handleTokenAAmountChange: (value: string) => void;
  isTokenAAmountEmpty: () => boolean;
  isTokenAAmountValid: () => boolean;

  // Token B props
  tokenBAmount: string;
  tokenBSymbol: string;
  tokenBIcon: string;
  tokenBBalance: any;
  handleTokenBAmountChange: (value: string) => void;
  isTokenBAmountEmpty: () => boolean;
  isTokenBAmountValid: () => boolean;

  // Common props
  calculateUSDValue: (symbol: string, amount: string) => string;
  handleSwapAmounts: () => void;
  projectData?: any;
  lastUpdatedField: string;
  hasAutoCalculationError: () => boolean;
}

export default function TokenDeposit({
  tokenAAmount,
  tokenASymbol,
  tokenAIcon,
  tokenABalance,
  handleTokenAAmountChange,
  isTokenAAmountEmpty,
  isTokenAAmountValid,
  tokenBAmount,
  tokenBSymbol,
  tokenBIcon,
  tokenBBalance,
  handleTokenBAmountChange,
  isTokenBAmountEmpty,
  isTokenBAmountValid,
  calculateUSDValue,
  handleSwapAmounts,
  projectData,
  lastUpdatedField,
  hasAutoCalculationError,
}: TokenDepositProps) {
  return (
    <>
      {/* Token Deposit Header */}
      <div>
        <h3 className="font-semibold mb-2">Deposit Tokens</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Specify the amount of tokens for your liquidity contribution.
        </p>
      </div>

      <div className="space-y-3">
        {/* Token A Input */}
        <div
          className={`p-4 border rounded-lg bg-muted/50 ${
            isTokenAAmountEmpty() || !isTokenAAmountValid()
              ? "border-red-500 bg-red-500/5"
              : "border-border"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <input
              type="text"
              value={tokenAAmount}
              onChange={(e) => handleTokenAAmountChange(e.target.value)}
              className={`flex-1 bg-transparent text-3xl font-mono focus:outline-none placeholder:text-muted-foreground ${
                isTokenAAmountEmpty() || !isTokenAAmountValid()
                  ? "text-red-500"
                  : ""
              }`}
              placeholder={tokenASymbol ? "0" : "Select token first"}
              disabled={!tokenASymbol}
            />
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs px-2 py-1 h-6"
                onClick={() =>
                  handleTokenAAmountChange(
                    (tokenABalance?.balance || new BigNumber(0)).toString()
                  )
                }
                disabled={
                  !tokenASymbol ||
                  !tokenABalance ||
                  tokenABalance.balance.isZero()
                }
              >
                MAX
              </Button>
              {tokenAIcon ? (
                <>
                  <Icon name={tokenAIcon} className="w-6 h-6" />
                  <span className="font-medium">{tokenASymbol}</span>
                </>
              ) : (
                <>
                  <Icon
                    name="mdi:help-circle-outline"
                    className="w-6 h-6 text-muted-foreground"
                  />
                  <span className="text-muted-foreground text-sm">
                    Select Token
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span
              className={
                !isTokenAAmountValid()
                  ? "text-red-500"
                  : "text-muted-foreground"
              }
            >
              {!tokenASymbol
                ? "-"
                : calculateUSDValue(tokenASymbol, tokenAAmount)}
            </span>
            <span
              className={
                !isTokenAAmountValid()
                  ? "text-red-500"
                  : "text-muted-foreground"
              }
            >
              {!tokenASymbol ? (
                "Select token to view balance"
              ) : (
                <>
                  Balance:{" "}
                  {(() => {
                    if (tokenABalance?.isLoading) return "Loading...";
                    if (!tokenABalance) return "Not Connected";
                    return tokenABalance.formatted || "0";
                  })()}{" "}
                  {tokenASymbol}
                  {!!projectData &&
                    tokenASymbol === projectData.ticker &&
                    tokenABalance?.totalSupply &&
                    " (Total Supply)"}
                </>
              )}
            </span>
          </div>
          {(isTokenAAmountEmpty() || !isTokenAAmountValid()) && (
            <div className="text-red-500 text-xs mt-2">
              {isTokenAAmountEmpty()
                ? `Enter ${tokenASymbol} amount`
                : lastUpdatedField === "tokenB" && hasAutoCalculationError()
                ? `Auto-calculation exceeds available ${tokenASymbol} balance`
                : "Amount exceeds available balance"}
            </div>
          )}
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 p-0 rounded-full border bg-background hover:bg-muted"
            onClick={handleSwapAmounts}
          >
            <Icon name="mdi:swap-vertical" className="w-5 h-5" />
          </Button>
        </div>

        {/* Token B Input */}
        <div
          className={`p-4 border rounded-lg bg-muted/50 ${
            isTokenBAmountEmpty() || !isTokenBAmountValid()
              ? "border-red-500 bg-red-500/5"
              : "border-border"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <input
              type="text"
              value={tokenBAmount}
              onChange={(e) => handleTokenBAmountChange(e.target.value)}
              className={`flex-1 bg-transparent text-3xl font-mono focus:outline-none placeholder:text-muted-foreground ${
                isTokenBAmountEmpty() || !isTokenBAmountValid()
                  ? "text-red-500"
                  : ""
              }`}
              placeholder={tokenBSymbol ? "0" : "Select token first"}
              disabled={!tokenBSymbol}
            />
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs px-2 py-1 h-6"
                onClick={() =>
                  handleTokenBAmountChange(
                    (tokenBBalance?.balance || new BigNumber(0)).toString()
                  )
                }
                disabled={
                  !tokenBSymbol ||
                  !tokenBBalance ||
                  tokenBBalance.balance.isZero()
                }
              >
                MAX
              </Button>
              {tokenBIcon ? (
                <>
                  <Icon name={tokenBIcon} className="w-6 h-6" />
                  <span className="font-medium">{tokenBSymbol}</span>
                </>
              ) : (
                <>
                  <Icon
                    name="mdi:help-circle-outline"
                    className="w-6 h-6 text-muted-foreground"
                  />
                  <span className="text-muted-foreground text-sm">
                    Select Token
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span
              className={
                !isTokenBAmountValid()
                  ? "text-red-500"
                  : "text-muted-foreground"
              }
            >
              {!tokenBSymbol
                ? "-"
                : calculateUSDValue(tokenBSymbol, tokenBAmount)}
            </span>
            <span
              className={
                !isTokenBAmountValid()
                  ? "text-red-500"
                  : "text-muted-foreground"
              }
            >
              {!tokenBSymbol ? (
                "Select token to view balance"
              ) : (
                <>
                  Balance:{" "}
                  {(() => {
                    if (tokenBBalance?.isLoading) return "Loading...";
                    if (!tokenBBalance) return "Not Connected";
                    return tokenBBalance.formatted || "0";
                  })()}{" "}
                  {tokenBSymbol}
                  {!!projectData &&
                    tokenBSymbol === projectData.ticker &&
                    tokenBBalance?.totalSupply &&
                    " (Total Supply)"}
                </>
              )}
            </span>
          </div>
          {(isTokenBAmountEmpty() || !isTokenBAmountValid()) && (
            <div className="text-red-500 text-xs mt-2">
              {isTokenBAmountEmpty()
                ? `Enter ${tokenBSymbol} amount`
                : lastUpdatedField === "tokenA" && hasAutoCalculationError()
                ? `Auto-calculation exceeds available ${tokenBSymbol} balance`
                : "Amount exceeds available balance"}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
