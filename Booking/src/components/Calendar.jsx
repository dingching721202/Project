import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiChevronLeft, FiChevronRight } = FiIcons;

const Calendar = ({ 
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

  const getCourseTitles = (date) => {
    const courses = getCoursesForDate(date);
    return courses.map(course => course.title);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      {/* 月份導航 */}
      <div className="flex items-center justify-between mb-6">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigateMonth(-1)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <SafeIcon icon={FiChevronLeft} className="w-5 h-5 text-gray-600" />
        </motion.button>
        
        <h2 className="text-2xl font-bold text-gray-800">
          {year}年 {monthNames[month]}
        </h2>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigateMonth(1)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <SafeIcon icon={FiChevronRight} className="w-5 h-5 text-gray-600" />
        </motion.button>
      </div>

      {/* 星期標題 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* 日期格子 */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          const coursesCount = getCoursesForDate(date).length;
          const selectedCoursesCount = getSelectedCoursesForDate(date).length;
          const courseTitles = getCourseTitles(date);
          
          return (
            <div
              key={index}
              className="relative group"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDateSelect(date)}
                className={`
                  relative w-full aspect-square p-1 rounded-xl transition-all duration-200
                  ${isSelected(date) 
                    ? 'bg-blue-500 text-white shadow-lg' 
                    : isToday(date)
                    ? 'bg-blue-100 text-blue-600 border-2 border-blue-300'
                    : isCurrentMonth(date)
                    ? 'hover:bg-gray-100 text-gray-800'
                    : 'text-gray-400 hover:bg-gray-50'
                  }
                `}
              >
                <div className="text-sm font-medium">
                  {date.getDate()}
                </div>
                
                {/* 課程指示器 */}
                {hasCourses(date) && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      isSelected(date) ? 'bg-white' : 'bg-blue-400'
                    }`} />
                    {coursesCount > 1 && (
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        isSelected(date) ? 'bg-white' : 'bg-blue-400'
                      }`} />
                    )}
                    {coursesCount > 2 && (
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        isSelected(date) ? 'bg-white' : 'bg-blue-400'
                      }`} />
                    )}
                  </div>
                )}
                
                {/* 已選課程指示器 */}
                {hasSelectedCourses(date) && (
                  <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                    isSelected(date) ? 'bg-yellow-300' : 'bg-green-400'
                  }`} />
                )}
              </motion.button>

              {/* 課程標題懸停提示 */}
              {courseTitles.length > 0 && (
                <div className="absolute z-10 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64">
                  <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl">
                    <div className="font-medium mb-1">
                      {date.getMonth() + 1}/{date.getDate()} 課程
                    </div>
                    <div className="space-y-1">
                      {courseTitles.map((title, idx) => (
                        <div key={idx} className="text-gray-200 truncate">
                          • {title}
                        </div>
                      ))}
                    </div>
                    {/* 小箭頭 */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 圖例 */}
      <div className="mt-6 flex flex-wrap gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-400"></div>
          <span>有課程</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
          <span>已選課程</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded border-2 border-blue-300 bg-blue-100"></div>
          <span>今天</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-900 rounded"></div>
          <span>懸停顯示課程</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar;