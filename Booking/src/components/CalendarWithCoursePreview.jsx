import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiChevronLeft, FiChevronRight, FiClock, FiUser } = FiIcons;

const CalendarWithCoursePreview = ({ 
  selectedDate, 
  onDateSelect, 
  currentMonth, 
  onMonthChange,
  getCoursesForDate,
  getSelectedCoursesForDate 
}) => {
  const today = new Date();
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // 獲取月份的第一天和最後一天
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  // 生成日曆天數
  const days = [];
  const current = new Date(startDate);
  
  for (let i = 0; i < 42; i++) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ];

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    onMonthChange(newMonth);
  };

  const isToday = (date) => {
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === month;
  };

  const hasCourses = (date) => {
    return getCoursesForDate(date).length > 0;
  };

  const hasSelectedCourses = (date) => {
    return getSelectedCoursesForDate(date).length > 0;
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-3 sm:p-6">
      {/* 月份導航 */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigateMonth(-1)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <SafeIcon icon={FiChevronLeft} className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
        </motion.button>
        
        <h2 className="text-lg sm:text-2xl font-bold text-gray-800">
          {year}年 {monthNames[month]}
        </h2>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigateMonth(1)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <SafeIcon icon={FiChevronRight} className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
        </motion.button>
      </div>

      {/* 星期標題 */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs sm:text-sm font-medium text-gray-500 py-1 sm:py-2">
            {day}
          </div>
        ))}
      </div>

      {/* 日期格子 - 響應式高度和間距 */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {days.map((date, index) => {
          const coursesForDate = getCoursesForDate(date);
          const selectedCoursesCount = getSelectedCoursesForDate(date).length;
          
          return (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              onClick={() => onDateSelect(date)}
              className={`
                relative min-h-16 sm:min-h-24 md:min-h-28 p-1 sm:p-2 rounded-lg sm:rounded-xl border-2 cursor-pointer transition-all duration-200
                ${isSelected(date) 
                  ? 'border-blue-500 bg-blue-50 shadow-lg' 
                  : isToday(date)
                  ? 'border-blue-300 bg-blue-50'
                  : isCurrentMonth(date)
                  ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  : 'border-gray-100 bg-gray-50'
                }
              `}
            >
              {/* 日期數字 */}
              <div className={`text-xs sm:text-sm font-medium mb-1 ${
                isSelected(date) 
                  ? 'text-blue-600' 
                  : isToday(date)
                  ? 'text-blue-600'
                  : isCurrentMonth(date)
                  ? 'text-gray-800'
                  : 'text-gray-400'
              }`}>
                {date.getDate()}
              </div>

              {/* 課程列表 - 針對手機優化 */}
              <div className="space-y-0.5 sm:space-y-1">
                {/* 手機版：只顯示第一個課程的簡短標題 */}
                <div className="block sm:hidden">
                  {coursesForDate.length > 0 && (
                    <div
                      className={`text-[10px] px-1 py-0.5 rounded truncate leading-tight ${
                        isSelected(date)
                          ? 'bg-blue-200 text-blue-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                      title={coursesForDate[0].title}
                    >
                      {coursesForDate[0].title.length > 8 
                        ? coursesForDate[0].title.substring(0, 8) + '...'
                        : coursesForDate[0].title
                      }
                    </div>
                  )}
                  {coursesForDate.length > 1 && (
                    <div className={`text-[9px] text-center mt-0.5 ${
                      isSelected(date) ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      +{coursesForDate.length - 1}
                    </div>
                  )}
                </div>

                {/* 平板和桌面版：顯示更多課程 */}
                <div className="hidden sm:block">
                  {coursesForDate.slice(0, 2).map((course, idx) => (
                    <div
                      key={idx}
                      className={`text-xs p-1 rounded truncate ${
                        isSelected(date)
                          ? 'bg-blue-200 text-blue-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                      title={course.title}
                    >
                      {course.title}
                    </div>
                  ))}
                  
                  {/* 更多課程指示 */}
                  {coursesForDate.length > 2 && (
                    <div className={`text-xs p-1 rounded text-center ${
                      isSelected(date)
                        ? 'bg-blue-300 text-blue-800'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      +{coursesForDate.length - 2} 更多
                    </div>
                  )}
                </div>
              </div>

              {/* 已選課程指示器 */}
              {hasSelectedCourses(date) && (
                <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-400" />
              )}

              {/* 手機版課程數量指示器 */}
              {coursesForDate.length > 0 && (
                <div className="block sm:hidden absolute bottom-0.5 left-1/2 transform -translate-x-1/2">
                  <div className="flex space-x-0.5">
                    {Array.from({ length: Math.min(coursesForDate.length, 3) }).map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-1 h-1 rounded-full ${
                          isSelected(date) ? 'bg-blue-300' : 'bg-blue-400'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* 圖例 - 響應式字體 */}
      <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 sm:gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gray-100 rounded border"></div>
          <span className="text-xs">有課程</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-400"></div>
          <span className="text-xs">已選課程</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded border-2 border-blue-300 bg-blue-50"></div>
          <span className="text-xs">今天</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded border-2 border-blue-500 bg-blue-50"></div>
          <span className="text-xs">已選日期</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarWithCoursePreview;