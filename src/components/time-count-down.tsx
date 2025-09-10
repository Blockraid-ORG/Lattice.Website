'use client'
import Countdown, { zeroPad } from 'react-countdown';

type TPropsRender = {
  days: number
  hours: number
  minutes: number
  seconds: number
  completed: boolean
  milliseconds: number
}
export default function TimeCountDown({ date }: { date?: string }) {
  const dateItem = new Date(date!).getTime()
  const renderer = (props: TPropsRender) => {
    if (!props.completed) {
      return (
        <div className='flex gap-1'>
          <ItemCount data={zeroPad(props.days)} />
          <ItemCount data={zeroPad(props.hours)} />
          <ItemCount data={zeroPad(props.minutes)} />
          <ItemCount data={zeroPad(props.seconds)} />
        </div>
      )
    }
  };
  return (
    <div>
      <Countdown
        daysInHours
        date={new Date(dateItem)}
        intervalDelay={0}
        precision={60}
        renderer={renderer}
      />
    </div>
  )
}

const ItemCount = (props: { data: number | string }) => {
  return (
    <div className='text-sm font-bold h-7 w-7 rounded bg-foreground text-primary-foreground flex items-center justify-center'>{props.data}</div>
  )
}
