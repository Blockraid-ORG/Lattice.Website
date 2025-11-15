import { Icon } from '@/components/icon'

export default function UserLeaderBoard() {
  return (
    <div className="bg-chart-gradient relative p-3 md:p-4 rounded-2xl">
      <div>
        <div className="text-sm">Your Stats</div>
      </div>
      <div className="py-7 flex items-center gap-2 font-semibold text-slate-600 dark:text-slate-200">
        <div className='text-3xl'>$</div>
        <h2 className="text-3xl font-mono">0</h2>
      </div>
      <div className="flex gap-3">
        <div className="w-full">
          <div className="text-sm font-medium mb-2">Terravest Points</div>
          <div className="flex items-center gap-2">
            <Icon className="text-2xl" name={"ic:round-terrain"} />
            <div className="text-xl font-semibold font-mono">{0}</div>
          </div>
        </div>
        <div className="w-full">
          <div className="text-sm font-medium mb-2">Ranking</div>
          <div className="flex items-center gap-2">
            <Icon className="text-2xl" name={"ic:baseline-star-half"} />
            <div className="text-xl font-semibold font-mono">{0}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
