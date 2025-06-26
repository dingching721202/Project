import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiX, FiCalendar, FiClock, FiDollarSign } = FiIcons;

const SelectedCourses = ({ selectedCourses, onRemoveCourse }) => {
  const totalPrice = selectedCourses.reduce((sum, item) => sum + item.course.price, 0);

  const formatDate = (date) => {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const groupedCourses = selectedCourses.reduce((groups, item) => {
    const dateString = item.dateString;
    if (!groups[dateString]) {
      groups[dateString] = [];
    }
    groups[dateString].push(item);
    return groups;
  }, {});

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800">已選課程</h3>
        <div className="text-xs sm:text-sm text-gray-600">
          共 {selectedCourses.length} 堂課
        </div>
      </div>

      {selectedCourses.length === 0 ? (
        <div className="text-center py-6 sm:py-8">
          <div className="text-gray-400 text-3xl sm:text-4xl mb-4">📚</div>
          <p className="text-gray-500 text-sm sm:text-base">尚未選擇任何課程</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 sm:space-y-4 max-h-48 sm:max-h-64 overflow-y-auto mb-4">
            <AnimatePresence>
              {Object.entries(groupedCourses).map(([dateString, courses]) => (
                <motion.div
                  key={dateString}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-l-4 border-blue-400 pl-3 sm:pl-4"
                >
                  <div className="text-xs sm:text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <SafeIcon icon={FiCalendar} className="w-3 h-3 sm:w-4 sm:h-4" />
                    {formatDate(courses[0].date)}
                  </div>
                  {courses.map((item) => (
                    <motion.div
                      key={item.key}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="bg-gray-50 rounded-lg p-2 sm:p-3 mb-2 flex items-center justify-between"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-800 text-sm truncate pr-2">
                          {item.course.title}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                          <div className="flex items-center gap-1">
                            <SafeIcon icon={FiClock} className="w-3 h-3" />
                            <span>{item.timeSlot.time}</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <SafeIcon icon={FiDollarSign} className="w-3 h-3" />
                            <span>${item.course.price}</span>
                          </div>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onRemoveCourse(item.key)}
                        className="p-1 sm:p-2 rounded-full hover:bg-red-100 text-red-500 transition-colors flex-shrink-0"
                      >
                        <SafeIcon icon={FiX} className="w-3 h-3 sm:w-4 sm:h-4" />
                      </motion.button>
                    </motion.div>
                  ))}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* 總計 */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between text-base sm:text-lg font-bold text-gray-800">
              <span>總金額</span>
              <span className="text-blue-600">${totalPrice}</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 sm:py-3 rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg text-sm sm:text-base"
            >
              確認選課
            </motion.button>
          </div>
        </>
      )}
    </div>
  );
};

export default SelectedCourses;