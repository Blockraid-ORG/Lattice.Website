import PresaleList from "./(user-stats)/contributions/presale-list"
import PresaleOverview from "./(user-stats)/presale-overview"
import UserLeaderBoard from "./(user-stats)/user-leader-board"

export default function DashboardPage() {
  return (
    <div className='my-5'>
      <div className="grid lg:grid-cols-2 gap-4">
        <PresaleOverview />
        <UserLeaderBoard />
      </div>
      <PresaleList />
    </div>
  )
}
