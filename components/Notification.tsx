
import React, { useEffect, useState } from 'react';
import { CloseIcon } from './icons/CloseIcon';

interface NotificationProps {
  title: string;
  message: string;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ title, message, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger fade-in animation
        setIsVisible(true);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        // Allow time for fade-out animation before calling parent's onClose
        setTimeout(onClose, 300); 
    }

  return (
    <div 
        className={`bg-gray-800 border border-purple-500 shadow-lg rounded-lg p-4 flex items-start gap-4 transition-all duration-300 ease-in-out ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}
        role="alert"
    >
        <div className="flex-shrink-0 text-purple-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
        </div>
      <div className="flex-1">
        <h3 className="font-bold text-yellow-300">{title}</h3>
        <p className="text-sm text-gray-300">{message}</p>
      </div>
      <button onClick={handleClose} className="p-1 rounded-full hover:bg-gray-700 -mt-1 -mr-1">
        <CloseIcon />
      </button>
    </div>
  );
};

export default Notification;
