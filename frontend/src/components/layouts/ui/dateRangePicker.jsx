import { useEffect, useRef } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { BiCalendar } from "react-icons/bi";

function DateRangePicker() {
  const pickerRef = useRef(null);

  useEffect(() => {
    // Calculate last 30 days range
    const today = new Date();
    const last30Days = new Date();
    last30Days.setDate(today.getDate() - 30);

    flatpickr(pickerRef.current, {
      mode: "range",
      dateFormat: "Y-m-d",
      allowInput: true,
      defaultDate: [last30Days, today], // Set default range
    });
  }, []);

  return (
    <div className="flex space-x-1">
       <button className="px-2 py-1 border border-blue-500 text-sm text-blue bg-blue-100 shadown rounded">
            <BiCalendar/>
        </button>
        <input
        ref={pickerRef}
        placeholder="Select Date Range"
        className="px-2 border border-blue-500 text-sm font-semibold text-blue-600 bg-blue-100 shadow rounded "
        />
    </div>
    
  );
}

export default DateRangePicker;
