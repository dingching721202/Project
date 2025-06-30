import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiX, FiClock, FiUser, FiDollarSign, FiCheck } = FiIcons;

const CourseModal = ({ selectedDate, availableCourses, selectedCourses, onCourseSelect, onClose }) => {
  if (!selectedDate) return null;

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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 標題欄 */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">選擇課程</h2>
              <p className="text-blue-100">{formatDate(selectedDate)}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-200"
            >
              <SafeIcon icon={FiX} className="text-xl" />
            </motion.button>
          </div>
        </div>

        {/* 課程列表 */}
        <div className="p-6 overflow-y-auto max-h-96">
          {availableCourses.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📚</div>
              <p className="text-gray-500 text-lg">這一天沒有安排課程</p>
            </div>
          ) : (
            <div className="space-y-4">
              {availableCourses.map((course) => (
                <motion.div
                  key={`${course.id}-${course.timeSlot}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onCourseSelect(course)}
                  className={`
                    p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                    ${isCourseSelected(course)
                      ? 'border-green-500 bg-green-50 shadow-lg shadow-green-500/20'
                      : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {course.title}
                        </h3>
                        {isCourseSelected(course) && (
                          <div className="p-1 bg-green-500 rounded-full">
                            <SafeIcon icon={FiCheck} className="text-white text-sm" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <SafeIcon icon={FiClock} className="text-blue-500" />
                          <span>{course.timeSlot}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <SafeIcon icon={FiUser} className="text-indigo-500" />
                          <span>{course.instructor}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <SafeIcon icon={FiDollarSign} className="text-green-500" />
                          <span className="font-semibold">${course.price}</span>
                        </div>
                      </div>
                      
                      {course.description && (
                        <p className="text-gray-600 text-sm mt-2">
                          {course.description}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CourseModal;