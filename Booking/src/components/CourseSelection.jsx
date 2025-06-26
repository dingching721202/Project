import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiClock, FiUser, FiMapPin, FiCheck } = FiIcons;

const CourseSelection = ({ selectedDate, courses, selectedCourses, onCourseSelect }) => {
  const formatDate = (date) => {
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const isTimeSlotSelected = (courseId, timeSlotId) => {
    const courseKey = `${courseId}-${timeSlotId}-${selectedDate.toDateString()}`;
    return selectedCourses.some(item => item.key === courseKey);
  };

  if (courses.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">
          {formatDate(selectedDate)} 的課程
        </h3>
        <div className="text-center py-6 sm:py-8">
          <div className="text-gray-400 text-3xl sm:text-4xl mb-4">📅</div>
          <p className="text-gray-500 text-sm sm:text-base">這天沒有可選的課程</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">
        {formatDate(selectedDate)} 的課程
      </h3>
      <div className="space-y-3 sm:space-y-4 max-h-64 sm:max-h-96 overflow-y-auto">
        {courses.map((course) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-gray-200 rounded-xl p-3 sm:p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-800 text-base sm:text-lg truncate pr-2">
                  {course.title}
                </h4>
                <p className="text-gray-600 text-xs sm:text-sm mt-1 line-clamp-2">
                  {course.description}
                </p>
              </div>
              <div className="text-right text-sm text-gray-500 flex-shrink-0">
                <div className="font-medium text-blue-600">${course.price}</div>
              </div>
            </div>

            {/* 課程資訊 - 響應式佈局 */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <SafeIcon icon={FiUser} className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="truncate">{course.instructor}</span>
              </div>
              <div className="flex items-center gap-1">
                <SafeIcon icon={FiMapPin} className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="truncate">{course.location}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs sm:text-sm font-medium text-gray-700 mb-2">可選時段：</div>
              {course.timeSlots.map((timeSlot) => {
                const isSelected = isTimeSlotSelected(course.id, timeSlot.id);
                return (
                  <motion.button
                    key={timeSlot.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onCourseSelect(course, timeSlot)}
                    className={`
                      w-full flex items-center justify-between p-2 sm:p-3 rounded-lg border-2 transition-all text-xs sm:text-sm
                      ${isSelected 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }
                    `}
                  >
                    <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
                      <SafeIcon icon={FiClock} className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="font-medium truncate">{timeSlot.time}</span>
                      <span className="text-gray-600 hidden sm:inline">
                        ({timeSlot.duration}分鐘)
                      </span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                      <span className="text-gray-600 text-xs">
                        {timeSlot.enrolled}/{timeSlot.capacity}
                      </span>
                      {isSelected && (
                        <SafeIcon icon={FiCheck} className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CourseSelection;