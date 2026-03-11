"use client";

import { useState } from "react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "hugeicons-react";

interface TimeSlot {
  time: string;
  available: boolean;
  price?: number;
}

interface AvailableDate {
  date: string;
  available: boolean;
  slots: TimeSlot[];
  price?: number;
}

interface AvailabilityCalendarProps {
  value: string;
  onChange: (date: string, timeSlot?: string) => void;
  selectedTimeSlot?: string;
  availableDates?: AvailableDate[];
  minDate?: string;
}

export default function AvailabilityCalendar({
  value,
  onChange,
  selectedTimeSlot,
  availableDates = [],
  minDate,
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [showTimeSlots, setShowTimeSlots] = useState(false);

  const today = new Date();
  const selectedDate = value ? new Date(value) : null;

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Mock availability data - replace with API call
  const getDateAvailability = (dateString: string): AvailableDate | undefined => {
    return availableDates.find(d => d.date === dateString);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

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
    
    const availability = getDateAvailability(dateString);
    
    if (availability && availability.available) {
      onChange(dateString);
      if (availability.slots.length > 0) {
        setShowTimeSlots(true);
      } else {
        setShowTimeSlots(false);
        setIsOpen(false);
      }
    } else if (!minDate || date >= new Date(minDate)) {
      onChange(dateString);
      setShowTimeSlots(false);
    }
  };

  const handleTimeSlotClick = (timeSlot: string) => {
    onChange(value, timeSlot);
    setIsOpen(false);
    setShowTimeSlots(false);
  };

  const isDateDisabled = (day: number) => {
    if (!minDate) return false;
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const date = new Date(year, month, day);
    const min = new Date(minDate);
    return date < min;
  };

  const isDateAvailable = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const date = new Date(year, month, day);
    const dateString = date.toISOString().split('T')[0];
    const availability = getDateAvailability(dateString);
    return availability?.available || false;
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
  const selectedAvailability = value ? getDateAvailability(value) : undefined;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff5e00] font-sans text-left bg-white hover:border-gray-400 transition-colors text-[#222]"
      >
        <div className="flex items-center justify-between">
          <span>{formatDisplayDate()}</span>
          {selectedTimeSlot && (
            <span className="text-[#ff5e00] text-[12px] font-semibold ml-2">
              {selectedTimeSlot}
            </span>
          )}
        </div>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setIsOpen(false);
              setShowTimeSlots(false);
            }}
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
            <div className="grid grid-cols-7 gap-1 mb-4">
              {days.map((day, index) => {
                if (day === null) {
                  return <div key={index} className="aspect-square" />;
                }

                const available = isDateAvailable(day);
                const disabled = !available || isDateDisabled(day);
                const selected = isDateSelected(day);
                const todayDate = isToday(day);

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => !disabled && handleDateClick(day)}
                    disabled={disabled}
                    className={`
                      aspect-square rounded-lg text-[14px] font-medium font-sans relative
                      transition-all duration-200
                      ${disabled 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : selected
                        ? 'bg-[#ff5e00] text-white shadow-lg scale-105'
                        : available
                        ? 'text-gray-700 hover:bg-[#fff5e6] hover:scale-105 border border-green-200'
                        : todayDate
                        ? 'bg-gray-100 text-[#ff5e00] font-bold border-2 border-[#ff5e00]'
                        : 'text-gray-400 hover:bg-gray-50'
                      }
                    `}
                  >
                    {day}
                    {available && !selected && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Time Slots */}
            {showTimeSlots && selectedAvailability && selectedAvailability.slots.length > 0 && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h4 className="text-[#222] text-[14px] font-bold mb-3 font-sans">Available Time Slots</h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedAvailability.slots.map((slot, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleTimeSlotClick(slot.time)}
                      disabled={!slot.available}
                      className={`
                        px-3 py-2 rounded-lg text-[13px] font-medium font-sans
                        transition-all duration-200
                        ${!slot.available
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : selectedTimeSlot === slot.time
                          ? 'bg-[#ff5e00] text-white shadow-md'
                          : 'bg-gray-50 text-gray-700 hover:bg-[#fff5e6] hover:border border-[#ff5e00]'
                        }
                      `}
                    >
                      {slot.time}
                      {slot.price && (
                        <span className="block text-[11px] mt-1 opacity-75">
                          ${slot.price}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="border-t border-gray-200 pt-3 mt-4 flex items-center justify-center gap-4 text-[11px] text-gray-600 font-sans">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded border border-green-200 bg-white"></span>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-gray-300"></span>
                <span>Unavailable</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

