// frontend/src/components/Common/LoadingSpinner.js
export const LoadingSpinner = ({ size = 'medium' }) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-16 w-16'
  };

  return (
    <div className="flex justify-center">
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}></div>
    </div>
  ); 
};
export default LoadingSpinner;