import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiClock, FiUser, FiDollarSign, FiCheck, FiX, FiBookOpen } = FiIcons;

const CourseSelection = ({ selectedDate, availableCourses, selectedCourses, onCourseSelect, onClose }) => {
  if (!selectedDate || !availableCourses.length) return null;

  const formatDate = (date) => {
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const isCourseSelected = (course) => {
    const courseKey = `${course.id}-${course.timeSlot}`;
    return selectedCourses.some(c => `${c.id}-${c.timeSlot}` === courseKey);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100"
    >
      {/* 標題欄 - 與月曆圓角保持一致 */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-t-xl sm:rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white bg-opacity-20 rounded-full">
              <SafeIcon icon={FiBookOpen} className="text-sm" />
            </div>
            <div>
              <h3 className="text-sm font-bold">選擇課程</h3>
              <p className="text-blue-100 text-xs leading-tight">{formatDate(selectedDate)}</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-1.5 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-200"
          >
            <SafeIcon icon={FiX} className="text-sm" />
          </motion.button>
        </div>
      </div>

      {/* 課程列表 - 優化字體大小和間距 */}
      <div className="p-4 max-h-80 overflow-y-auto">
        <div className="space-y-3">
          <AnimatePresence>
            {availableCourses.map((course) => (
              <motion.div
                key={`${course.id}-${course.timeSlot}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onCourseSelect(course)}
                className={`
                  p-3 rounded-lg border-2 cursor-pointer transition-all duration-200
                  ${isCourseSelected(course)
                    ? 'border-green-500 bg-green-50 shadow-md shadow-green-500/20'
                    : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'
                  }
                `}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-sm font-semibold text-gray-800 leading-tight">
                        {course.title}
                      </h4>
                      {isCourseSelected(course) && (
                        <div className="p-1 bg-green-500 rounded-full flex-shrink-0">
                          <SafeIcon icon={FiCheck} className="text-white text-xs" />
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-1 text-xs text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <SafeIcon icon={FiClock} className="text-blue-500 flex-shrink-0" />
                        <span>{course.timeSlot}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <SafeIcon icon={FiUser} className="text-indigo-500 flex-shrink-0" />
                        <span>{course.instructor}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <SafeIcon icon={FiDollarSign} className="text-green-500 flex-shrink-0" />
                        <span className="font-semibold">${course.price.toLocaleString()}</span>
                      </div>
                    </div>
                    {course.description && (
                      <p className="text-gray-600 text-xs mt-2 line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseSelection;