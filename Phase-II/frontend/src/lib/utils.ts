export const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  if (password.length < 8) return false;
  if (password.length > 128) return false;
  return true;
};

export const formatTaskStatus = (isCompleted: boolean): string => {
  return isCompleted ? 'Completed' : 'Incomplete';
};

export const getStatusColor = (isCompleted: boolean): string => {
  return isCompleted ? 'text-green-600' : 'text-red-600';
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};