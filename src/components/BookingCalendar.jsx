import { useState } from 'react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

export function BookingCalendar({ availableDates }) {
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)

  // Group dates by date
  const groupedDates = availableDates.reduce(
    (acc, slot) => {
      if (!acc[slot.date]) {
        acc[slot.date] = []
      }
      acc[slot.date].push(slot)
      return acc
    },
    {}
  )

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekday = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()]
    return { month, day, weekday }
  }

  return (
    <div className="space-y-4">
      {/* Date Selection */}
      <div className="space-y-2">
        <p className="text-sm font-medium">날짜</p>
        <div className="grid grid-cols-3 gap-2">
          {Object.keys(groupedDates).map((date) => {
            const { month, day, weekday } = formatDate(date)
            const isSelected = selectedDate === date
            return (
              <Button
                key={date}
                variant={isSelected ? "default" : "outline"}
                className={`flex flex-col h-auto py-3 ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                onClick={() => {
                  setSelectedDate(date)
                  setSelectedTime(null)
                }}
              >
                <span className="text-xs">{weekday}</span>
                <span className="text-lg font-bold">
                  {month}/{day}
                </span>
              </Button>
            )
          })}
        </div>
      </div>

      {/* Time Selection */}
      {selectedDate && (
        <div className="space-y-2">
          <p className="text-sm font-medium">시간</p>
          <div className="space-y-2">
            {groupedDates[selectedDate].map((slot) => {
              const isSelected = selectedTime === slot.time
              const isFull = slot.available === 0
              return (
                <Button
                  key={slot.time}
                  variant={isSelected ? "default" : "outline"}
                  className={`w-full justify-between ${
                    isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
                  } ${isFull ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => !isFull && setSelectedTime(slot.time)}
                  disabled={isFull}
                >
                  <span>{slot.time}</span>
                  <Badge variant={isFull ? "secondary" : "outline"} className="ml-2">
                    {isFull ? "마감" : `${slot.available}석`}
                  </Badge>
                </Button>
              )
            })}
          </div>
        </div>
      )}

      {selectedDate && selectedTime && (
        <div className="p-3 bg-primary/5 rounded-lg text-sm">
          <p className="font-medium mb-1">선택한 일정</p>
          <p className="text-muted-foreground">
            {selectedDate} {selectedTime}
          </p>
        </div>
      )}
    </div>
  )
}
