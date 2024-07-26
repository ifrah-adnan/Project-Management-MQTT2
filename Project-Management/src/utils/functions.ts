export function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export const numberToStringReverse = (str: number | string) => {
  // string 1h30min
  if (typeof str === "number") {
    const hours = Math.floor(str / 60);
    const minutes = str % 60;
    return `${hours}h${minutes}min`;
  } else {
    const [hours, minutes] = str?.split("h");
    return parseInt(hours) * 60 + parseInt(minutes.replace("min", ""));
  }
};
