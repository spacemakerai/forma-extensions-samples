import _ from "lodash";
import { CalendarIcon } from "../assets/CalendarIcon";

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

type DateSelectorProps = {
  month: number;
  setMonth: (month: number) => void;
  day: number;
  setDay: (day: number) => void;
};

export default function DateSelector(props: DateSelectorProps) {
  const { month, setMonth, day, setDay } = props;

  return (
    <div class={"section"}>
      <CalendarIcon />
      <div class="selectors">
        <select class="month" value={month} onChange={(event) => setMonth(parseInt(event.currentTarget.value, 10))}>
          {MONTHS.map((name, value) => (
            <option value={value}>{name}</option>
          ))}
        </select>
        <select class="date" value={day} onChange={(event) => setDay(parseInt(event.currentTarget.value, 10))}>
          {_.range(1, 31).map((value) => (
            <option value={value}>{value}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
