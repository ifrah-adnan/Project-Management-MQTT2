import * as React from "react";
import { Moon, MoonStarIcon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  const icon = isMounted ? theme === "dark" ? <Moon /> : <Sun /> : null;

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="transition-all duration-300 ease-in-out"
    >
      {icon &&
        React.cloneElement(icon, {
          className:
            "h-[1.2rem] w-[1.2rem] transition-all duration-300 ease-in-out",
        })}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
