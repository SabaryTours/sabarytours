"use client";

import { useState } from "react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "hugeicons-react";

interface CustomCalendarProps {
  value: string;
  onChange: (date: string) => void;
  minDate?: string;
}

export default function CustomCalendar({ value, onChange, minDate }: CustomCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);

  const today = new Date();
  const selectedDate = value ? new Date(value) : null;

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const handleDateClick = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const date = new Date(year, month, day);
    const dateString = date.toISOString().split('T')[0];
    onChange(dateString);
    setIsOpen(false);
  };

  const isDateDisabled = (day: number) => {
    if (!minDate) return false;
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const date = new Date(year, month, day);
    const min = new Date(minDate);
    return date < min;
  };

  const isDateSelected = (day: number) => {
    if (!selectedDate) return false;
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year
    );
  };

  const isToday = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const formatDisplayDate = () => {
    if (!value) return "Select a date";
    const date = new Date(value);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff5e00] font-sans text-left bg-white hover:border-gray-400 transition-colors"
      >
        {formatDisplayDate()}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50 min-w-[320px]">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft01Icon className="w-5 h-5 text-[#222]" />
              </button>
              <h3 className="text-[#222] text-[16px] font-bold font-sans">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              <button
                type="button"
                onClick={goToNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowRight01Icon className="w-5 h-5 text-[#222]" />
              </button>
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((day) => (
                <div key={day} className="text-center text-[12px] font-semibold text-gray-600 font-sans py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                if (day === null) {
                  return <div key={index} className="aspect-square" />;
                }

                const disabled = isDateDisabled(day);
                const selected = isDateSelected(day);
                const todayDate = isToday(day);

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => !disabled && handleDateClick(day)}
                    disabled={disabled}
                    className={`
                      aspect-square rounded-lg text-[14px] font-medium font-sans
                      transition-all duration-200
                      ${disabled 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : selected
                        ? 'bg-[#ff5e00] text-white shadow-lg scale-105'
                        : todayDate
                        ? 'bg-gray-100 text-[#ff5e00] font-bold border-2 border-[#ff5e00]'
                        : 'text-gray-700 hover:bg-gray-100 hover:scale-105'
                      }
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

