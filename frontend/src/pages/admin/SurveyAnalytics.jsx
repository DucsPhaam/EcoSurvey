import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { adminService } from '../../services/adminService'
import { SpinnerPage } from '../../components/ui/Spinner'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { ArrowLeft, Users, BarChart2, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

export default function SurveyAnalytics() {
  const { t } = useTranslation('admin')
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await adminService.getSurveyAnalytics(id)
        setData(res.data)
      } catch (err) {
        toast.error(t('surveyAnalytics.loadFailed'))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (loading) return <SpinnerPage />
  if (!data) return <div className="p-8 text-center text-gray-500">{t('surveyAnalytics.noData')}</div>

  const { survey, total_responses, questions } = data

  // Colors for chart bars
  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899']

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/surveys" className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-brand-600" />
            {t('surveyAnalytics.analytics')} {survey.title}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t('surveyAnalytics.status')} <span className="font-semibold text-gray-700 dark:text-gray-300">{survey.status}</span>
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 border-l-4 border-l-brand-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-brand-50 dark:bg-brand-900/20 text-brand-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-medium text-gray-500">{t('surveyAnalytics.totalResponses')}</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{total_responses}</p>
        </div>
        <div className="card p-5 border-l-4 border-l-blue-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-medium text-gray-500">{t('surveyAnalytics.questions')}</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{questions.length}</p>
        </div>
      </div>

      {/* Questions Breakdown */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white pt-4 border-t border-gray-200 dark:border-gray-800">
          {t('surveyAnalytics.responsesPerQuestion')}
        </h2>

        {questions.length === 0 ? (
          <p className="text-gray-500">{t('surveyAnalytics.noQuestions')}</p>
        ) : (
          questions.map((q, index) => {
            const isChoice = q.question_type === 'Single_Choice' || q.question_type === 'Multiple_Choice'
            
            // Format data for chart
            let chartData = []
            if (isChoice && q.answers) {
              chartData = Object.keys(q.answers).map(key => ({
                name: key,
                count: q.answers[key]
              }))
            }

            return (
              <div key={q.id} className="card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      <span className="text-brand-600 mr-2">Q{index + 1}.</span>
                      {q.question_text}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-medium">
                      {q.question_type.replace('_', ' ')} • {t('surveyAnalytics.responseRate')}: {q.response_rate}%
                    </p>
                  </div>
                </div>

                {total_responses === 0 ? (
                  <p className="text-sm text-gray-400 italic">{t('surveyAnalytics.noResponses')}</p>
                ) : isChoice ? (
                  chartData.length > 0 ? (
                    <div className="h-64 w-full mt-6">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <XAxis type="number" allowDecimals={false} />
                          <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
                          <Tooltip 
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">{t('surveyAnalytics.noAnswers')}</p>
                  )
                ) : (
                  // Text responses
                  <div className="mt-4 max-h-64 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {q.answers && q.answers.length > 0 ? (
                      q.answers.map((ans, i) => (
                        <div key={i} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800 text-sm text-gray-700 dark:text-gray-300">
                          {ans}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400 italic">{t('surveyAnalytics.noTextAnswers')}</p>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
