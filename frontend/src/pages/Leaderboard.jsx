import { useEffect, useState } from 'react'
import { Trophy, Medal, Star, Crown } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/axiosInstance'
import { SpinnerPage } from '../components/ui/Spinner'

const MEDALS = [
  { bg: 'from-yellow-400 to-amber-500', text: 'text-yellow-900', icon: Crown  },
  { bg: 'from-gray-300 to-gray-400',    text: 'text-gray-700',   icon: Medal  },
  { bg: 'from-orange-400 to-amber-600', text: 'text-orange-900', icon: Medal  },
]

function RankBadge({ rank }) {
  if (rank <= 3) {
    const { bg, text, icon: Icon } = MEDALS[rank - 1]
    return (
      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${bg} flex items-center justify-center shadow-lg`}>
        <Icon className={`w-5 h-5 ${text}`} />
      </div>
    )
  }
  return (
    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
      <span className="text-sm font-bold text-gray-500">#{rank}</span>
    </div>
  )
}

export default function Leaderboard() {
  const { user } = useAuth()
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod]   = useState('all')

  const fetch = async (p) => {
    setLoading(true)
    try {
      const res = await api.get('/leaderboard', { params: { period: p } })
      setData(res.data)
    } catch { /* ignore */ } finally { setLoading(false) }
  }

  useEffect(() => { fetch('all') }, [])

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="page-header text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Trophy className="w-8 h-8 text-white" />
        </div>
        <h1 className="page-title">Leaderboard</h1>
        <p className="page-subtitle">Top contributors in environmental awareness.</p>
      </div>

      {/* Period tabs */}
      <div className="flex gap-2 justify-center mb-8">
        {[['week','This Week'], ['month','This Month'], ['all','All Time']].map(([p, label]) => (
          <button key={p} onClick={() => { setPeriod(p); fetch(p) }}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              period === p
                ? 'bg-brand-600 text-white shadow-glow-sm'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-brand-400'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? <SpinnerPage /> : (
        <>
          {/* Top 3 podium */}
          {data?.leaderboard?.length >= 3 && (
            <div className="flex items-end justify-center gap-4 mb-8">
              {/* 2nd */}
              <div className="text-center flex-1">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center mx-auto mb-2 shadow-lg text-gray-700 font-bold text-xl">
                  {data.leaderboard[1]?.full_name?.[0]}
                </div>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 truncate">{data.leaderboard[1]?.full_name}</p>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{data.leaderboard[1]?.total_points} pts</p>
                <div className="h-16 bg-gradient-to-t from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-t-xl mt-2 flex items-center justify-center">
                  <span className="font-bold text-2xl text-gray-500">2</span>
                </div>
              </div>
              {/* 1st */}
              <div className="text-center flex-1">
                <div className="relative">
                  <Crown className="w-6 h-6 text-amber-400 mx-auto mb-1" />
                  <div className="w-18 h-18 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 flex items-center justify-center mx-auto mb-2 shadow-glow-green text-2xl font-bold text-yellow-900" style={{ width: 72, height: 72 }}>
                    {data.leaderboard[0]?.full_name?.[0]}
                  </div>
                </div>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{data.leaderboard[0]?.full_name}</p>
                <p className="text-base font-bold text-amber-500">{data.leaderboard[0]?.total_points} pts</p>
                <div className="h-24 bg-gradient-to-t from-amber-400 to-yellow-400 rounded-t-xl mt-2 flex items-center justify-center">
                  <span className="font-bold text-3xl text-yellow-900">1</span>
                </div>
              </div>
              {/* 3rd */}
              <div className="text-center flex-1">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-300 to-amber-600 flex items-center justify-center mx-auto mb-2 shadow-lg text-orange-900 font-bold text-xl">
                  {data.leaderboard[2]?.full_name?.[0]}
                </div>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 truncate">{data.leaderboard[2]?.full_name}</p>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{data.leaderboard[2]?.total_points} pts</p>
                <div className="h-12 bg-gradient-to-t from-orange-200 to-orange-300 dark:from-orange-900/40 dark:to-orange-800/40 rounded-t-xl mt-2 flex items-center justify-center">
                  <span className="font-bold text-2xl text-orange-600">3</span>
                </div>
              </div>
            </div>
          )}

          {/* Full list */}
          <div className="card overflow-hidden">
            {(data?.leaderboard || []).map((entry, i) => {
              const isMe = entry.user_id === user?.id
              return (
                <div key={entry.user_id}
                  className={`flex items-center gap-4 px-5 py-4 border-b dark:border-gray-800 last:border-0 transition-colors ${
                    isMe ? 'bg-brand-50 dark:bg-brand-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'}`}>
                  <RankBadge rank={entry.rank} />
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-accent-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {entry.full_name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${isMe ? 'text-brand-700 dark:text-brand-400' : 'text-gray-800 dark:text-gray-200'}`}>
                      {entry.full_name} {isMe && <span className="text-xs font-normal ml-1 opacity-70">(You)</span>}
                    </p>
                    <p className="text-xs text-gray-400">{entry.role}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm ${isMe ? 'text-brand-600 dark:text-brand-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      {entry.total_points.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">points</p>
                  </div>
                </div>
              )
            })}

            {/* My rank if outside top 10 */}
            {data?.my_rank && data.my_rank > 10 && (
              <div className="px-5 py-4 border-t-2 border-dashed dark:border-gray-700 bg-brand-50 dark:bg-brand-900/20">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center">
                    <span className="text-sm font-bold text-brand-600">#{data.my_rank}</span>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-accent-400 flex items-center justify-center text-white font-bold text-sm">
                    {user?.full_name?.[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-brand-700 dark:text-brand-400">{user?.full_name} (You)</p>
                    <p className="text-xs text-gray-400">Your current position</p>
                  </div>
                  <p className="font-bold text-brand-600">{data.my_points.toLocaleString()} pts</p>
                </div>
              </div>
            )}
          </div>

          <p className="text-center text-sm text-gray-400 mt-4">
            {data?.total_participants || 0} participants ranked
          </p>
        </>
      )}
    </div>
  )
}
