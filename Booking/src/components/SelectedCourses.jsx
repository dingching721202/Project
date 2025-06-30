import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiBookOpen, FiTrash2, FiCheck, FiCalendar, FiClock, FiUser, FiDollarSign } = FiIcons;

const SelectedCourses = ({ selectedCourses, onRemoveCourse, onConfirmSelection, totalAmount }) => {
  // 如果沒有選擇任何課程，不顯示組件
  if (selectedCourses.length === 0) {
    return null;
  }

  // 按日期分組課程
  const groupedCourses = selectedCourses.reduce((groups, course) => {
    const date = course.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(course);
    return groups;
  }, {});

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-TW', {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const sortedDates = Object.keys(groupedCourses).sort();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 h-fit"
    >
      {/* 標題 - 與課程選擇保持一致的設計 */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-t-xl sm:rounded-t-2xl">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white bg-opacity-20 rounded-full">
            <SafeIcon icon={FiBookOpen} className="text-sm" />
          </div>
          <div>
            <h2 className="text-sm font-bold">已選課程</h2>
            <p className="text-indigo-100 text-xs">
              {selectedCourses.length} 門課程
            </p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* 課程列表 - 優化字體和間距 */}
        <div className="space-y-3 mb-4 max-h-72 overflow-y-auto">
          <AnimatePresence>
            {sortedDates.map((date) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-2"
              >
                {/* 日期標題 */}
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 border-b border-gray-200 pb-1">
                  <SafeIcon icon={FiCalendar} className="text-indigo-500" />
                  <span>{formatDate(date)}</span>
                </div>

                {/* 該日期的課程 */}
                {groupedCourses[date].map((course) => (
                  <motion.div
                    key={`${course.id}-${course.timeSlot}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 mb-1.5 text-xs leading-tight">
                          {course.title}
                        </h4>
                        <div className="space-y-1 text-xs text-gray-600">
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
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onRemoveCourse(course)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors duration-200 flex-shrink-0"
                      >
                        <SafeIcon icon={FiTrash2} className="text-xs" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* 總計和確認按鈕 - 優化設計 */}
        <div className="border-t border-gray-200 pt-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700">總計</span>
            <span className="text-lg font-bold text-green-600">
              ${totalAmount.toLocaleString()}
            </span>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onConfirmSelection}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2.5 px-4 rounded-lg font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            <SafeIcon icon={FiCheck} className="text-sm" />
            確認選課
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default SelectedCourses;