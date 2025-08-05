const getWeekRange = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDay(); // 0 for Sunday, 1 for Monday, etc.
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start of week

  const startDate = new Date(date.setDate(diff));
  const endDate = new Date(date.setDate(startDate.getDate() + 6));

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
};

const getNextWeekRange = (currentStartDateString, currentEndDateString) => {
  const currentEndDate = new Date(currentEndDateString);
  const nextStartDate = new Date(currentEndDate.setDate(currentEndDate.getDate() + 1));
  const nextEndDate = new Date(nextStartDate);
  nextEndDate.setDate(nextStartDate.getDate() + 6);

  return {
    startDate: nextStartDate.toISOString().split('T')[0],
    endDate: nextEndDate.toISOString().split('T')[0],
  };
};

module.exports = {
  getWeekRange,
  getNextWeekRange,
};