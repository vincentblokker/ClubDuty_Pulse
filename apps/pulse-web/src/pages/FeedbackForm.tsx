import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

interface Ratee {
  id: string
  name: string
}

interface AssignmentData {
  assignmentId: string
  roundName: string
  ratees: Ratee[]
}

export const FeedbackForm: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>()
  const navigate = useNavigate()
  const [assignmentData, setAssignmentData] = useState<AssignmentData | null>(null)
  const [selectedRatee, setSelectedRatee] = useState<string>('')
  const [strengths, setStrengths] = useState<string[]>(['', ''])
  const [improvement, setImprovement] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (assignmentId) {
      loadAssignment()
    }
  }, [assignmentId])

  const loadAssignment = async () => {
    if (!assignmentId) return

    setIsLoading(true)
    const response = await api.get(`/feedback/${assignmentId}`)

    if (response.data) {
      setAssignmentData(response.data as AssignmentData)
    } else if (response.error) {
      setErrors({ general: response.error })
    }
    setIsLoading(false)
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!selectedRatee) {
      newErrors.ratee = 'Please select a teammate'
    }

    if (strengths.some(s => !s.trim())) {
      newErrors.strengths = 'Please provide both strengths'
    }

    if (strengths.some(s => s.trim().length < 3)) {
      newErrors.strengths = 'Each strength must be at least 3 characters long'
    }

    if (!improvement.trim()) {
      newErrors.improvement = 'Please provide an improvement area'
    }

    if (improvement.trim().length < 3) {
      newErrors.improvement = 'Improvement area must be at least 3 characters long'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    const response = await api.post('/feedback', {
      assignmentId,
      rateeId: selectedRatee,
      strengths: strengths.map(s => s.trim()),
      improvement: improvement.trim()
    })

    setIsSubmitting(false)

    if (response.data) {
      setSubmitted(true)
    } else if (response.error) {
      setErrors({ general: response.error })
    }
  }

  const handleStrengthChange = (index: number, value: string) => {
    const newStrengths = [...strengths]
    newStrengths[index] = value
    setStrengths(newStrengths)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-base-200)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: 'var(--color-primary)' }}></div>
          <p className="mt-4" style={{ color: 'color-mix(in oklab, var(--color-base-content) 70%, transparent)' }}>Loading feedback form...</p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-base-200)' }}>
        <div className="max-w-md w-full mx-4">
          <div className="rounded-lg shadow-lg p-8 text-center" style={{ backgroundColor: 'var(--color-base-100)' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'color-mix(in oklab, var(--color-success) 20%, transparent)' }}>
              <svg className="w-8 h-8" style={{ color: 'var(--color-success)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-base-content)' }}>Thank You!</h1>
            <p className="mb-6" style={{ color: 'color-mix(in oklab, var(--color-base-content) 70%, transparent)' }}>
              Your feedback has been submitted successfully. Your input helps your teammates grow and improve.
            </p>
            <button
              onClick={() => navigate('/')}
              className="w-full px-6 py-3 rounded-lg transition-colors"
              style={{ backgroundColor: 'var(--color-success)', color: 'var(--color-success-content)' }}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!assignmentData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-base-200)' }}>
        <div className="max-w-md w-full mx-4">
          <div className="rounded-lg shadow-lg p-8 text-center" style={{ backgroundColor: 'var(--color-base-100)' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'color-mix(in oklab, var(--color-error) 20%, transparent)' }}>
              <svg className="w-8 h-8" style={{ color: 'var(--color-error)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-base-content)' }}>Form Not Available</h1>
            <p className="mb-6" style={{ color: 'color-mix(in oklab, var(--color-base-content) 70%, transparent)' }}>
              {errors.general || 'This feedback form is no longer available or has already been completed.'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="w-full px-6 py-3 rounded-lg transition-colors"
              style={{ backgroundColor: 'var(--color-error)', color: 'var(--color-error-content)' }}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4" style={{ backgroundColor: 'var(--color-base-200)' }}>
      <div className="max-w-2xl mx-auto py-6 md:py-8">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-responsive-2xl font-bold mb-2" style={{ color: 'var(--color-base-content)' }}>Team Feedback</h1>
          <p className="text-sm md:text-base" style={{ color: 'color-mix(in oklab, var(--color-base-content) 70%, transparent)' }}>{assignmentData.roundName}</p>
          <p className="text-sm mt-2" style={{ color: 'color-mix(in oklab, var(--color-base-content) 60%, transparent)' }}>
            Help your teammates grow by sharing your honest feedback
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-lg shadow-lg mobile-padding mobile-spacing" style={{ backgroundColor: 'var(--color-base-100)' }}>
          {/* Teammate Selection */}
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: 'var(--color-base-content)' }}>
              Select a teammate to give feedback to:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {assignmentData.ratees.map((ratee) => (
                <button
                  key={ratee.id}
                  type="button"
                  onClick={() => setSelectedRatee(ratee.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all touch-target ${
                    selectedRatee === ratee.id
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium truncate">{ratee.name}</div>
                  <div className="text-sm text-gray-600">
                    {selectedRatee === ratee.id ? 'Selected' : 'Click to select'}
                  </div>
                </button>
              ))}
            </div>
            {errors.ratee && (
              <p className="mt-2 text-sm text-red-600">{errors.ratee}</p>
            )}
          </div>

          {/* Strengths */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              What are this person's <strong>two strongest qualities</strong>?
            </label>
            <p className="text-sm text-gray-600 mb-4">
              Focus on specific behaviors and skills. Examples: "Great at explaining complex topics", "Always reliable under pressure"
            </p>

            <div className="mobile-spacing">
              {strengths.map((strength, index) => (
                <div key={index}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Strength {index + 1}:
                  </label>
                  <input
                    type="text"
                    value={strength}
                    onChange={(e) => handleStrengthChange(index, e.target.value)}
                    placeholder={`Enter strength ${index + 1}...`}
                    className="input-mobile"
                    maxLength={100}
                  />
                  <div className="mt-1 text-xs text-gray-500">
                    {strength.length}/100 characters
                  </div>
                </div>
              ))}
            </div>
            {errors.strengths && (
              <p className="mt-2 text-sm text-red-600">{errors.strengths}</p>
            )}
          </div>

          {/* Improvement Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              What is <strong>one area</strong> where this person could improve?
            </label>
            <p className="text-sm text-gray-600 mb-4">
              Be constructive and specific. Examples: "Could work on time management", "Sometimes interrupts others in meetings"
            </p>
            <textarea
              value={improvement}
              onChange={(e) => setImprovement(e.target.value)}
              placeholder="Enter one area for improvement..."
              rows={3}
              className="input-mobile resize-none"
              maxLength={280}
            />
            <div className="mt-1 text-xs text-gray-500">
              {improvement.length}/280 characters
            </div>
            {errors.improvement && (
              <p className="mt-2 text-sm text-red-600">{errors.improvement}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !selectedRatee}
            className="btn-mobile w-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-content)' }}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting Feedback...
              </div>
            ) : (
              'Submit Anonymous Feedback'
            )}
          </button>

          {errors.general && (
            <div className="mobile-card" style={{ backgroundColor: 'color-mix(in oklab, var(--color-error) 20%, transparent)', border: '1px solid color-mix(in oklab, var(--color-error) 50%, transparent)' }}>
              <p className="text-sm text-center" style={{ color: 'var(--color-error)' }}>{errors.general}</p>
            </div>
          )}

          {/* Privacy Notice */}
          <div className="text-center text-sm text-gray-500 border-t pt-4">
            <p>✨ Your feedback is completely anonymous and helps your teammates grow!</p>
          </div>
        </form>
      </div>
    </div>
  )
}
