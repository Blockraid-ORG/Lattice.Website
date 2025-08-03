'use client'
import { useProjectDetail } from '@/modules/project/project.query'
import { useUserVerified } from '@/modules/user-verified/user-verified.query'
import { useParams } from 'next/navigation'
import PresaleHeader from './presale-header'

export default function FormWhitelist() {
  const { projectId } = useParams()
  const { data, isLoading } = useProjectDetail(projectId.toString())
  const { data: verifiedAddress } = useUserVerified()
  const arrayAddress = verifiedAddress && verifiedAddress?.map(i => i.walletAddress)
  return (
    <div>
      {
        data && arrayAddress?.length && !isLoading && (
          <>
            <PresaleHeader data={data} />
            <div>FORM</div>
          </>
        )
      }
    </div>
  )
}
