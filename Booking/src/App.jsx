import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from './common/SafeIcon';
import Calendar from './components/Calendar';
import CourseSelection from './components/CourseSelection';
import SelectedCourses from './components/SelectedCourses';
import { mockCourses } from './data/mockCourses';
import './App.css';

const { FiCalendar } = FiIcons;

function App() {
  // 將初始日期設置為2025年6月
  const [currentDate, setCurrentDate] = useState(new Date(2025, 5, 1)); // 月份從0開始，5代表6月
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [showCourseSelection, setShowCourseSelection] = useState(false);

  // 處理日期選擇
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    const dateStr = date.toISOString().split('T')[0];
    const coursesForDate = mockCourses.filter(course => course.date === dateStr);
    setAvailableCourses(coursesForDate);
    setShowCourseSelection(coursesForDate.length > 0);
  };

  // 處理課程選擇
  const handleCourseSelect = (course) => {
    const courseKey = `${course.id}-${course.timeSlot}`;
    const isSelected = selectedCourses.some(c => `${c.id}-${c.timeSlot}` === courseKey);

    if (isSelected) {
      setSelectedCourses(prev => 
        prev.filter(c => `${c.id}-${c.timeSlot}` !== courseKey)
      );
    } else {
      setSelectedCourses(prev => [...prev, course]);
    }
  };

  // 移除已選課程
  const handleRemoveCourse = (courseToRemove) => {
    const courseKey = `${courseToRemove.id}-${courseToRemove.timeSlot}`;
    setSelectedCourses(prev => 
      prev.filter(c => `${c.id}-${c.timeSlot}` !== courseKey)
    );
  };

  // 確認選課
  const handleConfirmSelection = () => {
    alert(`🎉 已成功選擇 ${selectedCourses.length} 門課程！\n總金額: $${totalAmount.toLocaleString()}`);
  };

  // 關閉課程選擇面板
  const handleCloseCourseSelection = () => {
    setShowCourseSelection(false);
    setSelectedDate(null);
    setAvailableCourses([]);
  };

  // 計算總金額
  const totalAmount = selectedCourses.reduce((sum, course) => sum + course.price, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* 標題區域 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4 sm:mb-8"
        >
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full">
              <SafeIcon icon={FiCalendar} className="text-lg sm:text-2xl text-white" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              華語文課程
            </h1>
          </div>
        </motion.div>

        {/* 桌面版佈局：月曆在左，課程選擇和已選課程在右 */}
        <div className="flex lg:gap-4 gap-4 sm:gap-6">
          {/* 月曆區域 - 桌面版佔更寬的空間 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:flex-[2] w-full"
          >
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-6 border border-gray-100">
              <Calendar
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
                onDateSelect={handleDateSelect}
                selectedCourses={selectedCourses}
                mockCourses={mockCourses}
              />
            </div>

            {/* 手機版：課程選擇和已選課程區域顯示在月曆下方 */}
            <div className="lg:hidden mt-4 space-y-4">
              {/* 課程選擇區域 */}
              <AnimatePresence>
                {showCourseSelection && (
                  <CourseSelection
                    selectedDate={selectedDate}
                    availableCourses={availableCourses}
                    selectedCourses={selectedCourses}
                    onCourseSelect={handleCourseSelect}
                    onClose={handleCloseCourseSelection}
                  />
                )}
              </AnimatePresence>

              {/* 已選課程區域 - 無論何時都顯示（如果有選課的話） */}
              {selectedCourses.length > 0 && (
                <SelectedCourses
                  selectedCourses={selectedCourses}
                  onRemoveCourse={handleRemoveCourse}
                  onConfirmSelection={handleConfirmSelection}
                  totalAmount={totalAmount}
                />
              )}
            </div>
          </motion.div>

          {/* 右側區域 - 桌面版佔較窄的空間，使用固定寬度確保一致性 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block w-80 flex-shrink-0 space-y-4"
          >
            {/* 桌面版：課程選擇區域 */}
            <AnimatePresence>
              {showCourseSelection && (
                <CourseSelection
                  selectedDate={selectedDate}
                  availableCourses={availableCourses}
                  selectedCourses={selectedCourses}
                  onCourseSelect={handleCourseSelect}
                  onClose={handleCloseCourseSelection}
                />
              )}
            </AnimatePresence>

            {/* 桌面版：已選課程區域 - 只有選擇課程時才顯示 */}
            <AnimatePresence>
              <SelectedCourses
                selectedCourses={selectedCourses}
                onRemoveCourse={handleRemoveCourse}
                onConfirmSelection={handleConfirmSelection}
                totalAmount={totalAmount}
              />
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default App;