import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CalendarWithCoursePreview from './CalendarWithCoursePreview';
import CourseSelection from './CourseSelection';
import SelectedCourses from './SelectedCourses';
import { mockCourses } from '../data/mockData';

const CalendarCoursePlatform = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handleCourseSelect = (course, timeSlot) => {
    const courseKey = `${course.id}-${timeSlot.id}-${selectedDate.toDateString()}`;
    
    setSelectedCourses(prev => {
      const existingIndex = prev.findIndex(item => item.key === courseKey);
      
      if (existingIndex >= 0) {
        // 如果已存在，則移除
        return prev.filter(item => item.key !== courseKey);
      } else {
        // 如果不存在，則新增
        return [...prev, {
          key: courseKey,
          course,
          timeSlot,
          date: new Date(selectedDate),
          dateString: selectedDate.toDateString()
        }];
      }
    });
  };

  const handleRemoveCourse = (courseKey) => {
    setSelectedCourses(prev => prev.filter(item => item.key !== courseKey));
  };

  const getCoursesForDate = (date) => {
    const dateString = date.toDateString();
    return mockCourses.filter(course => 
      course.availableDates.some(availableDate => 
        new Date(availableDate).toDateString() === dateString
      )
    );
  };

  const getSelectedCoursesForDate = (date) => {
    const dateString = date.toDateString();
    return selectedCourses.filter(item => item.dateString === dateString);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-2">選課平台</h1>
          <p className="text-sm sm:text-base text-gray-600">在月曆上直接查看課程，點擊日期選擇課程</p>
        </motion.div>

        {/* 響應式佈局 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* 月曆區域 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 order-1"
          >
            <CalendarWithCoursePreview
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
              getCoursesForDate={getCoursesForDate}
              getSelectedCoursesForDate={getSelectedCoursesForDate}
            />
          </motion.div>

          {/* 右側面板 - 手機版放在下方 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4 sm:space-y-6 order-2"
          >
            {/* 課程選擇區域 */}
            <CourseSelection
              selectedDate={selectedDate}
              courses={getCoursesForDate(selectedDate)}
              selectedCourses={selectedCourses}
              onCourseSelect={handleCourseSelect}
            />

            {/* 已選課程區域 */}
            <SelectedCourses
              selectedCourses={selectedCourses}
              onRemoveCourse={handleRemoveCourse}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CalendarCoursePlatform;