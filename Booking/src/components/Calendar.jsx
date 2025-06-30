import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiChevronLeft, FiChevronRight } = FiIcons;

const Calendar = ({ currentDate, setCurrentDate, onDateSelect, selectedCourses, mockCourses }) => {
  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 獲取月份的第一天和最後一天
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // 生成日曆天數
  const days = [];
  // 前月的空白天數
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  // 當月的天數
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  // 月份導航
  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  // 獲取指定日期的課程
  const getCoursesForDate = (day) => {
    if (!day) return [];
    const dateStr = new Date(year, month, day).toISOString().split('T')[0];
    return mockCourses.filter(course => course.date === dateStr);
  };

  // 檢查日期是否有已選課程
  const hasSelectedCoursesOnDate = (day) => {
    if (!day) return false;
    const dateStr = new Date(year, month, day).toISOString().split('T')[0];
    return selectedCourses.some(course => course.date === dateStr);
  };

  // 檢查是否為今天
  const isToday = (day) => {
    if (!day) return false;
    return today.getFullYear() === year && 
           today.getMonth() === month && 
           today.getDate() === day;
  };

  // 截斷課程標題
  const truncateTitle = (title, maxLength = 6) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };

  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ];

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className="w-full">
      {/* 月份導航 */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigateMonth(-1)}
          className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg transition-all duration-200"
        >
          <SafeIcon icon={FiChevronLeft} className="text-lg sm:text-xl" />
        </motion.button>
        
        <div className="text-center">
          <p className="text-lg sm:text-xl font-bold text-gray-800">
            {year}年 {monthNames[month]}
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigateMonth(1)}
          className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg transition-all duration-200"
        >
          <SafeIcon icon={FiChevronRight} className="text-lg sm:text-xl" />
        </motion.button>
      </div>

      {/* 星期標題 */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-3">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center py-2 sm:py-3 text-sm font-semibold text-gray-600"
          >
            {day}
          </div>
        ))}
      </div>

      {/* 日曆網格 */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {days.map((day, index) => {
          const coursesForDay = getCoursesForDate(day);
          const hasSelectedCourses = hasSelectedCoursesOnDate(day);

          return (
            <motion.div
              key={index}
              whileHover={day ? { scale: 1.02 } : {}}
              whileTap={day ? { scale: 0.98 } : {}}
              onClick={day ? () => onDateSelect(new Date(year, month, day)) : undefined}
              className={`
                relative p-1 sm:p-2 rounded-lg sm:rounded-xl cursor-pointer transition-all duration-200 border-2
                ${day ? 'hover:shadow-lg hover:border-blue-300' : 'cursor-default border-transparent'}
                ${isToday(day) 
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-blue-600 shadow-lg' 
                  : 'bg-white border-gray-200'
                }
                ${!isToday(day) && day ? 'hover:bg-blue-50' : ''}
                ${hasSelectedCourses && !isToday(day) ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300' : ''}
                min-h-8 sm:min-h-24 lg:min-h-28
              `}
            >
              {day && (
                <div className="h-full flex flex-col">
                  {/* 日期數字 */}
                  <div className={`
                    text-xs sm:text-base lg:text-lg font-bold mb-1
                    ${isToday(day) 
                      ? 'text-white' 
                      : hasSelectedCourses 
                        ? 'text-green-700' 
                        : 'text-gray-800'
                    }
                  `}>
                    {day}
                  </div>

                  {/* 課程顯示 - 響應式設計 */}
                  <div className="flex-1 flex flex-col justify-end min-w-0">
                    {/* 桌面版：顯示課程標題和時間 - 兩排設計 */}
                    <div className="hidden sm:block space-y-1 overflow-hidden flex-1">
                      {coursesForDay.slice(0, 2).map((course, courseIndex) => {
                        const isSelected = selectedCourses.some(c => 
                          `${c.id}-${c.timeSlot}` === `${course.id}-${course.timeSlot}`
                        );

                        return (
                          <div
                            key={courseIndex}
                            title={course.title}
                            className={`
                              text-[10px] sm:text-xs p-1 sm:p-1.5 rounded-md font-medium transition-all duration-200 min-w-0
                              ${isSelected 
                                ? 'bg-green-500 text-white shadow-sm' 
                                : isToday(day) 
                                  ? 'bg-white bg-opacity-20 text-white' 
                                  : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                              }
                            `}
                          >
                            {/* 課程標題 - 第一排 */}
                            <div className="truncate font-semibold">
                              {truncateTitle(course.title, 8)}
                            </div>
                            {/* 時間 - 第二排 */}
                            <div className={`
                              text-[8px] sm:text-xs mt-0.5 opacity-80 truncate
                              ${isSelected 
                                ? 'text-green-100' 
                                : isToday(day) 
                                  ? 'text-blue-100' 
                                  : 'text-blue-600'
                              }
                            `}>
                              {course.timeSlot.split('-')[0]}
                            </div>
                          </div>
                        );
                      })}

                      {/* 更多課程指示器 - 桌面版 */}
                      {coursesForDay.length > 2 && (
                        <div className={`
                          text-[10px] sm:text-xs text-center py-1 rounded-md font-medium
                          ${isToday(day) 
                            ? 'text-blue-100' 
                            : hasSelectedCourses 
                              ? 'text-green-600' 
                              : 'text-blue-600'
                          }
                        `}>
                          +{coursesForDay.length - 2} 更多
                        </div>
                      )}
                    </div>

                    {/* 手機版：課程數量指示器 - 圓點設計 */}
                    <div className="sm:hidden flex justify-center items-end">
                      {coursesForDay.length > 0 && (
                        <div className="flex gap-0.5">
                          {Array.from({ length: Math.min(coursesForDay.length, 5) }).map((_, i) => (
                            <div
                              key={i}
                              className={`
                                w-1.5 h-1.5 rounded-full
                                ${hasSelectedCourses 
                                  ? 'bg-green-400' 
                                  : isToday(day) 
                                    ? 'bg-white bg-opacity-80' 
                                    : 'bg-blue-400'
                                }
                              `}
                            />
                          ))}
                          {coursesForDay.length > 5 && (
                            <div className={`
                              text-[8px] font-bold ml-1 leading-none
                              ${hasSelectedCourses 
                                ? 'text-green-600' 
                                : isToday(day) 
                                  ? 'text-white' 
                                  : 'text-blue-600'
                              }
                            `}>
                              +
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 已選課程指示器 */}
                  {hasSelectedCourses && (
                    <div className="absolute top-0.5 sm:top-1 right-0.5 sm:right-1">
                      <div className="w-1.5 h-1.5 sm:w-3 sm:h-3 bg-green-500 rounded-full shadow-lg shadow-green-500/50 animate-pulse"></div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* 圖例 */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 mt-4 sm:mt-6 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50"></div>
          <span className="text-gray-600">有課程</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full shadow-lg shadow-green-500/50"></div>
          <span className="text-gray-600">已選課程</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg"></div>
          <span className="text-gray-600">今天</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar;